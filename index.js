require('dotenv').config();
const mongoose = require('mongoose');
const discordClient = require('./bot/client');
const createServer = require('./server/server');
const { initCache } = require('./configCache');

async function main() {
  // 1) الاتصال بقاعدة البيانات
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ اتصل بـ MongoDB بنجاح');

  // 2) تحميل كل الإعدادات في الكاش قبل ما أي حاجة تشتغل
  await initCache();

  // 3) تشغيل البوت
  await discordClient.login(process.env.BOT_TOKEN);

  // 4) تشغيل السيرفر (بعد ما البوت يبقى جاهز عشان نقدر نجيب guilds.cache)
  const app = createServer(discordClient);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌐 الداشبورد شغالة على http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('❌ حصل خطأ أثناء التشغيل:', err);
  process.exit(1);
});
