const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// نقطة فحص للتأكد أن السيرفر يعمل
app.get('/', (req, res) => res.send('Steam Proxy Server V3 - Ready 🚀'));

// ---------------------------------------------------------
// 1. البحث في متجر Steam (بديل CheapShark)
// الرابط: /api/search?term=elden
// ---------------------------------------------------------
app.get('/api/search', async (req, res) => {
    try {
        const term = req.query.term;
        if (!term) return res.status(400).json({ error: "No search term provided" });

        // البحث في متجر ستيم الرسمي مع تحديد اللغة العربية والمنطقة السعودية
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

// ---------------------------------------------------------
// 4. جلب عدد اللاعبين الحاليين (الأثر)
// الرابط: /api/game/players?appId=12345
// ---------------------------------------------------------
app.get('/api/game/players', async (req, res) => {
    try {
        const appId = req.query.appId;
        
        // يمكن إضافة مفتاح API هنا إذا لزم الأمر في المستقبل: &key=${process.env.STEAM_API_KEY}
        let url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`;
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) { 
        // في حال الفشل، نعيد 0 بدلاً من تحطيم التطبيق
        res.json({ response: { player_count: 0, result: 0 } }); 
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server V3 running on port ${PORT}`);
});
