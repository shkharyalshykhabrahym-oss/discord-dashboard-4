/**
 * configCache.js
 * ---------------
 * ده الجزء الأهم في الربط بين الداشبورد والبوت.
 *
 * بدل ما البوت يعمل query على الداتابيز مع كل رسالة (ده بطيء وهيبطئ الفلترة)،
 * بنعمل "نسخة" من إعدادات كل سيرفر في الذاكرة (Map). البوت بيقرأ من الذاكرة دايماً.
 *
 * لما المستخدم يعمل Save في الداشبورد:
 *   1) بنحفظ في MongoDB (عشان تفضل الإعدادات محفوظة لو البوت اتقفل وفتح تاني)
 *   2) وفي نفس اللحظة بنحدّث الـ Map في الذاكرة مباشرة (instant.set)
 *   3) فالبوت يحس بالتغيير على طول من غير أي تأخير أو حاجة اسمها polling
 *
 * ده شغال لأن البوت والداشبورد بيشتغلوا في نفس الـ Node.js process (نفس البرنامج).
 * لو قررت تفصلهم لسيرفرين منفصلين لاحقاً، هتحتاج طريقة تانية للتزامن
 * (زي MongoDB Change Streams أو Redis Pub/Sub) - وهنسيب ملاحظة في الـ README لده.
 */

const GuildConfig = require('./models/GuildConfig');

const cache = new Map(); // guildId -> config object

const DEFAULT_CONFIG = {
  automodEnabled: true,
  badWords: [],
  logChannelId: null,
  whitelistedChannels: [],
};

/** تحميل كل الإعدادات من الداتابيز عند تشغيل البرنامج لأول مرة */
async function initCache() {
  const allConfigs = await GuildConfig.find();
  allConfigs.forEach((doc) => {
    cache.set(doc.guildId, doc.toObject());
  });
  console.log(`✅ تم تحميل إعدادات ${allConfigs.length} سيرفر في الكاش`);
}

/** جلب إعدادات سيرفر معين (بترجع نسخة افتراضية لو السيرفر لسه ملوش إعدادات) */
function getConfig(guildId) {
  return cache.get(guildId) || { guildId, ...DEFAULT_CONFIG };
}

/**
 * حفظ إعدادات سيرفر: بيكتب في الداتابيز وبيحدث الكاش فوراً
 * partialUpdate: أوبجكت فيه الحقول اللي عايز تغيرها بس، مش لازم كل الحقول
 */
async function saveConfig(guildId, partialUpdate) {
  const updated = await GuildConfig.findOneAndUpdate(
    { guildId },
    { $set: partialUpdate },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  cache.set(guildId, updated.toObject());
  return updated.toObject();
}

module.exports = { initCache, getConfig, saveConfig, cache };
