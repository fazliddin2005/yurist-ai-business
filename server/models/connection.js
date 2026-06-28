// models/connection.js
// ============================================================================
// MONGODB ULANISHI -- Vercel kabi serverless muhitda fayl tizimiga yozish
// ISHLAMAYDI (har bir so'rov yangi, vaqtinchalik konteynerda ishlaydi, disk
// o'zgarishlari saqlanmaydi). Shuning uchun barcha ma'lumot MongoDB'da saqlanadi.
//
// SERVERLESS UCHUN MUHIM: har bir funksiya chaqiruvida yangi ulanish ochish
// juda sekin va xarajatli bo'ladi. Shuning uchun ulanishni keshlаymiz
// (global o'zgaruvchida saqlaymiz) -- agar ulanish allaqachon mavjud bo'lsa,
// qayta ochilmaydi, mavjudini qayta ishlatadi.
// ============================================================================
const mongoose = require('mongoose');

let cachedConnection = null;
let connectingPromise = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  if (connectingPromise) {
    return connectingPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable topilmadi. .env fayliga (yoki Vercel'da " +
      "Environment Variables bo'limiga) MONGODB_URI qo'shing -- masalan " +
      "MongoDB Atlas orqali olingan ulanish satri."
    );
  }

  connectingPromise = mongoose
    .connect(uri, {
      // Mongoose 8 versiyasida ko'p sozlamalar standart bo'yicha yoqilgan,
      // shuning uchun qo'shimcha parametr kerak emas -- lekin serverless
      // muhitda ulanish pool hajmini cheklash foydali (juda ko'p parallel
      // ulanish ochib yubormaslik uchun).
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
    .then((conn) => {
      cachedConnection = conn;
      connectingPromise = null;
      console.log('[mongo] MongoDB ulanishi muvaffaqiyatli o\'rnatildi');
      return conn;
    })
    .catch((err) => {
      connectingPromise = null;
      console.error('[mongo] MongoDB ulanishida xato:', err.message);
      throw err;
    });

  return connectingPromise;
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected, mongoose };
