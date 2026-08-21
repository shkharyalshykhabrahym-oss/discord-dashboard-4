# لوحة تحكم بوت الحماية (Mod Dashboard)

## 📁 هيكل المشروع
```
discord-dashboard/
├── index.js              # نقطة التشغيل: يشغّل البوت + السيرفر مع بعض
├── configCache.js         # الكاش المشترك بين البوت والداشبورد (قلب التزامن الفوري)
├── models/GuildConfig.js  # شكل البيانات في MongoDB
├── bot/client.js          # البوت نفسه (discord.js) - الفلترة بتحصل هنا
├── server/
│   ├── server.js          # إعداد Express
│   ├── auth.js             # Discord OAuth2 + حماية الصلاحيات
│   └── routes/api.js       # الـ API endpoints
└── public/                # الفرونت إند (HTML/CSS/JS عادي - بدون build tools)
    ├── index.html          # صفحة اللوجين
    ├── dashboard.html       # صفحة التحكم
    ├── dashboard.js
    └── style.css
```

## 🚀 خطوات التشغيل

### 1) تثبيت المكتبات
```bash
npm install
```

### 2) إعداد بوت الديسكورد
1. روح [Discord Developer Portal](https://discord.com/developers/applications) → اختار أبليكيشن البوت بتاعك (أو اعمل واحد جديد)
2. من تبويب **OAuth2 → General**: هتلاقي `CLIENT_ID` و `CLIENT_SECRET`
3. من نفس الصفحة، تحت **Redirects** ضيف:
   ```
   http://localhost:3000/auth/discord/callback
   ```
4. من تبويب **Bot**: خد الـ `Token` بتاعه
5. تأكد إن الـ **Message Content Intent** مفعّل من نفس تبويب Bot (مطلوب عشان البوت يقرأ نص الرسائل)

### 3) إعداد MongoDB
- محلياً: نزّل [MongoDB Community](https://www.mongodb.com/try/download/community) وشغّله، أو
- سحابياً (أسهل): اعمل حساب مجاني على [MongoDB Atlas](https://www.mongodb.com/atlas) وخد الـ connection string

### 4) الملف البيئي
انسخ `.env.example` لملف اسمه `.env` واملأ القيم:
```bash
cp .env.example .env
```

### 5) شغّل المشروع
```bash
npm start
```
هتلاقي رسالة `🌐 الداشبورد شغالة على http://localhost:3000`

افتح المتصفح على `http://localhost:3000` وسجّل دخول بحساب الديسكورد بتاعك.

---

## ⚠️ ملاحظات مهمة قبل الرفع (Deploy) الفعلي

1. **الأمان**: لازم تغيّر `SESSION_SECRET` لحاجة عشوائية وطويلة (مش أي كلمة بسيطة)، ولو رفعت المشروع على VPS خليه يشتغل بـ HTTPS مش HTTP.
2. **الصلاحيات**: كل الراوتس اللي بتعدل إعدادات بتتحقق (`ensureGuildAdmin`) إن المستخدم عنده Administrator أو Manage Server على السيرفر ده تحديداً - متشيلش الفحص ده أبداً.
3. **فصل البوت عن السيرفر**: المشروع ده مبني على إن البوت والداشبورد بيشتغلوا في نفس البرنامج (process) عشان التزامن يبقى فوري ومباشر. لو حبيت تفصلهم على سيرفرين مختلفين مستقبلاً (مثلاً عشان الـ scaling)، هتحتاج تستبدل `configCache.js` بحل زي **MongoDB Change Streams** (يتطلب MongoDB Replica Set) أو **Redis Pub/Sub**.
4. **الـ .env**: متعملش commit للملف ده على Git أبداً - حط `.env` في ملف `.gitignore`.
5. **Rate Limiting**: لو الداشبورد هتكون public، يستحسن تضيف مكتبة زي `express-rate-limit` على الـ API عشان تمنع أي استغلال أو سبام على الفورم.

---

## 🔧 توسعات مقترحة (اختيارية)
- إضافة صفحات تانية للداشبورد: Welcome messages، Auto-roles، Logging channels
- إضافة regex patterns بدل كلمات ثابتة بس (يمسك تصريفات الكلمة)
- عرض عدد المرات اللي كل كلمة اتشالت فيها (إحصائيات)
