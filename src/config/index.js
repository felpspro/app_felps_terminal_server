import dotenv from 'dotenv';
const inProduction = process.env.NODE_ENV != 'development';
const envFile = inProduction ? '.env' : '.env.dev';
dotenv.config({ path: envFile });

export default {
    server: {
        port: 1000,
        inProduction: inProduction,
    },
    minio: {
        endPoint: 'https://files.felps.cc',
        accessKey: 'felps',
        secretKey: 'NKMzh7VPtJ33cEi6',
        publicURL: 'https://files.felps.cc',
        bucket: 'publico'
    }
}