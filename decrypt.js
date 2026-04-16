// decrypt.js
const fs = require('fs');
const crypto = require('crypto');

const SECRET_KEY = "wJlBzPWdLQw5Y8rHvKnGxTmZpXcVfNaU3sEhIjOkMlP=";

function decryptAuditTrail(filePath, base64SecretKey) {
    console.log("Mulai membaca dan mendekripsi file...\n");
    const key = Buffer.from(base64SecretKey, 'base64');
    
    if (!fs.existsSync(filePath)) {
        console.error("❌ File tidak ditemukan:", filePath);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    let row = 1;
    lines.forEach(line => {
        const encryptedText = line.trim();
        if (!encryptedText) return;

        const combined = Buffer.from(encryptedText, 'base64');
        const iv = combined.subarray(0, 12);
        const tag = combined.subarray(combined.length - 16);
        const ciphertext = combined.subarray(12, combined.length - 16);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        try {
            let decrypted = decipher.update(ciphertext, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            console.log(`--- Baris ${row} ---`);
            console.log(JSON.parse(decrypted));
            row++;
        } catch (e) {
            console.error(`Error di baris ${row}:`, e.message);
        }
    });
}

// Jalankan fungsi
decryptAuditTrail('audit_trail_pemilihan.jsonl', SECRET_KEY);