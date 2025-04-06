const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Veritabanı dosyasını /data dizininde oluştur
const dbPath = path.join(__dirname, '..', 'data', 'participants.db');

// /data dizininin var olduğundan emin ol
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanı oluşturulurken hata oluştu:', err.message);
  } else {
    console.log('Veritabanına bağlanıldı:', dbPath);
    // Katılımcılar tablosunu oluştur
    db.run(`
      CREATE TABLE IF NOT EXISTS participants (
        userId TEXT PRIMARY KEY,
        code TEXT,
        amountOff TEXT,
        amountMinimum TEXT,
        expiresAt TEXT
      )
    `);
  }
});

// Veritabanı işlemlerini fonksiyonlar olarak tanımla
const dbOperations = {
  // Kullanıcının daha önce katılıp katılmadığını kontrol et
  checkUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM participants WHERE userId = ?', [userId], (err, row) => {
        if (err) {
          console.error('Veritabanı sorgusu sırasında hata oluştu:', err.message);
          reject(err);
        }
        resolve(row);
      });
    });
  },

  // Kullanıcıyı ve indirim kodunu veritabanına ekle
  addUser: (userId, discountCode) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO participants (userId, code, amountOff, amountMinimum, expiresAt) VALUES (?, ?, ?, ?, ?)',
        [userId, discountCode.code, discountCode.amountOff, discountCode.amountMinimum, discountCode.expiresAt],
        (err) => {
          if (err) {
            console.error('Veritabanına ekleme sırasında hata oluştu:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  },

  // Kullanıcıyı veritabanından sil
  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM participants WHERE userId = ?', [userId], (err) => {
        if (err) {
          console.error('Veritabanından silme sırasında hata oluştu:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Veritabanını kapat
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('Veritabanı kapatılırken hata oluştu:', err.message);
          reject(err);
        } else {
          console.log('Veritabanı bağlantısı kapatıldı.');
          resolve();
        }
      });
    });
  },
};

module.exports = dbOperations;