import mongoose from 'mongoose';
import { nanoid } from 'nanoid'

export const FILES = mongoose.model('terminal_files', new mongoose.Schema({
    id: { type: String, default: () => nanoid() },
    file: {
        name: { type: String, default: null, },
        url: { type: String, default: null, },
    },
    version: { type: String, default: null, },
    isNow: { type: Boolean, default: false, },
    createdBy: {
        id: { type: String, default: null, },
        name: { type: String, default: null, },
    },
    updatedBy: {
        id: { type: String, default: null, },
        name: { type: String, default: null, },
    }
}, { timestamps: true }))

export const CLIENTS = mongoose.model('terminal_clients', new mongoose.Schema({
    id: { type: String, default: () => nanoid() },
    code: { type: Number, default: null, },
    name: { type: String, default: null, },
    online: { type: Boolean, default: false, },
    params: {
        printers: [
            {
                enabled: { type: Boolean, default: false, },
                name: { type: String, default: null },
            }
        ],

        // Estas configurações são usadas no terminal e em alguns casos na rota que lista impressoras
        configs: {
            isPublic: { type: Boolean, default: false }, // caso true indica que este host tera suas impressoras selecionas disponiveis para outros terminais imprimirem
            // Capa de pedido?
            isPrinter_capaPedido: {
                enabled: { type: Boolean, default: false },
                printer: { type: String, default: null },
            },
            // ecommerce: Danfe simplificada?
            isPrinter_danfeSimple: {
                enabled: { type: Boolean, default: false },
                printer: { type: String, default: null },
            },
            // ecommerce: etiqueta de envio?
            isPrinter_shippingLabel: {
                enabled: { type: Boolean, default: false },
                printer: { type: String, default: null },
            },
        }
    }
}, { timestamps: true }))