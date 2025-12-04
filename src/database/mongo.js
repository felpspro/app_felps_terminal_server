import mongoose from 'mongoose';

export default async function (log = false){
  try {
    await mongoose.connect(`mongodb+srv://db_felps:lexuEXFtNp1LO0WK@clustermain.v9xhy.mongodb.net/db_terminal`);
    if(log){
      console.log('✅ MongoDB: Conectado!');
    }
  } catch (err) {
    console.error('❌ MongoDB: Erro ao conectar', err.message);
    throw err
}
};