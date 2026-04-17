require('dotenv').config();
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

const SECRET_KEY = process.env.SECRET_KEY;

app.post('/api/decrypt', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    if (!SECRET_KEY) {
        return res.status(500).json({ error: 'Server error: Secret key tidak ditemukan' });
    }

    const key = Buffer.from(SECRET_KEY, 'base64');
    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split('\n');
    
    const results = [];
    const errors = [];

    lines.forEach((line, index) => {
        const encryptedText = line.trim();
        if (!encryptedText) return;

        try {
            const combined = Buffer.from(encryptedText, 'base64');
            const iv = combined.subarray(0, 12);
            const tag = combined.subarray(combined.length - 16);
            const ciphertext = combined.subarray(12, combined.length - 16);

            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(ciphertext, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            
            results.push(JSON.parse(decrypted));
        } catch (e) {
            errors.push(`Baris ${index + 1}: ${e.message}`);
        }
    });

    res.json({
        success: true,
        totalData: results.length,
        data: results,
        errors: errors.length > 0 ? errors : undefined
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});