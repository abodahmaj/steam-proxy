// استيراد المكتبات الضرورية
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // لقراءة المتغيرات البيئية (مثل المفتاح)

const app = express();
// تحديد المنفذ (يأخذه من البيئة أو يستخدم 3000 كاحتياطي)
const PORT = process.env.PORT || 3000;

// تفعيل CORS للسماح لتطبيقك بالاتصال بهذا الخادم من أي مكان
app.use(cors());

// نقطة فحص سريعة للتأكد أن الخادم يعمل
app.get('/', (req, res) => {
    res.send('خادم Steam Proxy يعمل بنجاح! 🚀');
});

// ---------------------------------------------------------
// 1. نقطة اتصال لجلب تفاصيل لعبة (Store Data)
// الرابط: /api/game/details?appId=12345
// ---------------------------------------------------------
app.get('/api/game/details', async (req, res) => {
    try {
        const appId = req.query.appId;
        
        if (!appId) {
            return res.status(400).json({ error: "الرجاء توفير رقم اللعبة (appId)" });
        }

        // الاتصال بمتجر Steam
        // نضيف cc=sa للحصول على الأسعار بالريال السعودي، و l=arabic للغة العربية
        const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=sa&l=arabic`);
        
        // إرسال البيانات للتطبيق
        res.json(response.data);

    } catch (error) {
        console.error("خطأ في جلب التفاصيل:", error.message);
        res.status(500).json({ error: "فشل الاتصال بخوادم Steam Store" });
    }
});

// ---------------------------------------------------------
// 2. نقطة اتصال لجلب الأخبار (Web API)
// الرابط: /api/game/news?appId=12345
// ---------------------------------------------------------
app.get('/api/game/news', async (req, res) => {
    try {
        const appId = req.query.appId;
        if (!appId) return res.status(400).json({ error: "مطلوب appId" });

        // جلب الأخبار
        const response = await axios.get(`http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=3&maxlength=300&format=json`);
        
        res.json(response.data);

    } catch (error) {
        console.error("خطأ في جلب الأخبار:", error.message);
        res.status(500).json({ error: "فشل جلب الأخبار من Steam API" });
    }
});

// ---------------------------------------------------------
// 3. نقطة اتصال لجلب عدد اللاعبين الحاليين (مثال لاستخدام المفتاح السري)
// الرابط: /api/game/players?appId=12345
// ---------------------------------------------------------
app.get('/api/game/players', async (req, res) => {
    try {
        const appId = req.query.appId;
        // هنا نستخدم المفتاح السري المحفوظ في بيئة السيرفر وليس في كود الواجهة
        const apiKey = process.env.STEAM_API_KEY; 

        if (!apiKey) {
            console.warn("تحذير: لم يتم العثور على مفتاح Steam API في متغيرات البيئة");
            return res.status(500).json({ error: "المفتاح غير مهيأ في الخادم" });
        }

        const response = await axios.get(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}&key=${apiKey}`);
        res.json(response.data);

    } catch (error) {
        console.error("خطأ في جلب عدد اللاعبين:", error.message);
        res.status(500).json({ error: "فشل الاتصال بـ Steam API" });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل الآن على المنفذ ${PORT}`);
    console.log(`🔗 رابط التجربة المحلي: http://localhost:${PORT}`);
});
