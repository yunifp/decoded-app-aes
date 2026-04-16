// encrypt.js
const fs = require('fs');
const crypto = require('crypto');

const SECRET_KEY = "wJlBzPWdLQw5Y8rHvKnGxTmZpXcVfNaU3sEhIjOkMlP="; // Sama dengan di Constant.kt

function encryptData(plainText, base64SecretKey) {
    const key = Buffer.from(base64SecretKey, 'base64');
    const iv = crypto.randomBytes(12); // GCM_IV_LENGTH = 12

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag(); // GCM_TAG_LENGTH = 128 bit (16 byte)

    // Di Java, doFinal() menghasilkan CipherText + Tag. 
    // Format aplikasi Anda: IV + (CipherText + Tag)
    const combined = Buffer.concat([iv, encrypted, tag]);
    return combined.toString('base64');
}

// Simulasi 2 data suara masuk
const dummyData1 = {
    timestamp: Date.now(),
    nik: "3215000011112222",
    noUrutList: ["2"],
    namaKandidatList: ["Asep Surasep"]
};

const dummyData2 = {
    timestamp: Date.now() + 1000,
    nik: "3215000033334444",
    noUrutList: ["1"],
    namaKandidatList: ["Budi Santoso"]
};

// Enkripsi data
const line1 = encryptData(JSON.stringify(dummyData1), SECRET_KEY);
const line2 = encryptData(JSON.stringify(dummyData2), SECRET_KEY);

// Simpan ke file (Append)
fs.writeFileSync('audit_trail_pemilihan.jsonl', line1 + '\n');
fs.appendFileSync('audit_trail_pemilihan.jsonl', line2 + '\n');

console.log("✅ File audit_trail_pemilihan.jsonl berhasil dibuat dengan data terenkripsi!");