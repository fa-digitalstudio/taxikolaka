const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Ganti semua %NAMA_VAR% dengan nilai dari sistem / Vercel
Object.keys(process.env).forEach(key => {
    const pattern = new RegExp(`%${key}%`, 'g');
    if (process.env[key]) html = html.replace(pattern, process.env[key]);
});

fs.writeFileSync(htmlPath, html);
console.log("✅ Variabel Firebase sudah dimuat dari Environment Vercel");
