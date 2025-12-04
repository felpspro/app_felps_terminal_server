import { Router } from "express";
import multer from "multer";
import { s3 } from "#services/minio";           // sua instância já configurada
import { PutObjectCommand } from "@aws-sdk/client-s3";
import config from "#config";
import {CLIENTS, FILES} from '#database/entities'

const r = Router();
const upload = multer({ storage: multer.memoryStorage() });

r.get('/printers', async(req,res) => {
    try {
        const clients = await CLIENTS.find({ online: true });
        const printers = clients.flatMap(({ code: host, name, params, name: clientName }) =>
        params.printers
            .filter(p => p.enabled)
            .map(p => ({
            printer: p.name,
            host,
            label: `${name} : ${p.name}`
            }))
        );
        res.status(200).json({ data: { printers } })
    } catch (error) {
        res.status(500).json({ message: 'Erro interno. Contate o suporte' })
    }
})

r.get("/version/:version", async(req,res) => {
    try {
        const { version } = req.params;
        // 
        const data = await FILES.findOne({ isNow:true })
        if(data==null||data.version!=version){
            res.status(426).json({
                data: {
                    status: 426,
                    version: data.version,
                    uploadAt: data.createdAt,
                    fileName: data.file.name,
                    fileUrl: data.file.url,
                }
            })
        }else{
            res.status(200).json({ 
                data: {
                    status: 200,
                    message: 'Terminal atualizado'
                }
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro interno. Contate o suporte' })
    }
})

r.post("/upload", upload.array("files"), async (req, res) => {
  if (!req.files?.length) 
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
    const {version = null} = req.body;
    const folder = "terminal/version";
    const uploaded = await Promise.all(
        req.files.map(async (file) => {
            const name = `${file.originalname}`.replace(/ /g, "_");
            const key = `${folder}/${name}`;

            await s3.send(new PutObjectCommand({
                Bucket: config.minio.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            const PUBLIC_URL = `${config.minio.publicURL}/publico/${key}`

            // Salvando em banco a nova versão
            await FILES.updateMany({}, { isNow: false });
            await FILES({
                version,
                'file.name': name,
                'file.url': PUBLIC_URL,
                'isNow':true
            }).save()

            return {
                name: file.originalname,
                url: PUBLIC_URL,
            };
        })
    );
    res.json({ files: uploaded });
});

export default r;
