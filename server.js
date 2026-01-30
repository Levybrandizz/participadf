const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve os arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));

// Garante que o index.html seja o padrão
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor Local Rodando: http://localhost:${PORT}`);
    console.log(`🌐 Aguardando o Túnel Cloudflare...`);
});