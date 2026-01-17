const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// نقطة فحص
app.get('/', (req, res) => res.send('Steam Proxy Server V2 - Ready 🚀'));

// ---------------------------------------------------------
// 1. البحث في متجر Steam (بديل CheapShark)
// الرابط: /api/search?term=elden
// ---------------------------------------------------------
app.get('/api/search', async (req, res) => {
    try {
        const term = req.query.term;
        if (!term) return res.status(400).json({ error: "No search term provided" });

        // البحث في متجر ستيم الرسمي
        const response = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=arabic&cc=sa`);
        res.json(response.data);
    } catch (error) {
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Failed to search Steam" });
    }
});

// ---------------------------------------------------------
// 2. جلب تفاصيل لعبة محددة
// الرابط: /api/game/details?appId=12345
// ---------------------------------------------------------
app.get('/api/game/details', async (req, res) => {
    try {
        const appId = req.query.appId;
        if (!appId) return res.status(400).json({ error: "No appId provided" });

        const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=sa&l=arabic`);
        res.json(response.data);
    } catch (error) {
        console.error("Details Error:", error.message);
        res.status(500).json({ error: "Failed to fetch details" });
    }
});

// ---------------------------------------------------------
// 3. جلب الألعاب المميزة (الترند/المستكشف)
// الرابط: /api/featured
// ---------------------------------------------------------
app.get('/api/featured', async (req, res) => {
    try {
        // يجلب القوائم الرسمية من واجهة المتجر (الأكثر مبيعاً، جديد، عروض)
        const response = await axios.get('https://store.steampowered.com/api/featuredcategories?l=arabic&cc=sa');
        res.json(response.data);
    } catch (error) {
        console.error("Featured Error:", error.message);
        res.status(500).json({ error: "Failed to fetch featured games" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
