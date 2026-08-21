const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuildAdmin } = require('../auth');
const { getConfig, saveConfig } = require('../../configCache');

/** بيانات المستخدم الحالي (يُستخدم في الفرونت إند لعرض اسمه وصورته) */
router.get('/me', ensureAuth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
  });
});

/**
 * السيرفرات اللي المستخدم عنده صلاحية إدارة فيها *و* البوت موجود فيها فعلاً
 * (بنقارن قايمة سيرفرات المستخدم مع قايمة سيرفرات البوت)
 */
router.get('/guilds', ensureAuth, (req, res) => {
  const client = req.app.get('discordClient');

  const ADMINISTRATOR = 0x8;
  const MANAGE_GUILD = 0x20;

  const manageableGuilds = req.user.guilds.filter((g) => {
    const permissions = BigInt(g.permissions);
    return (
      (permissions & BigInt(ADMINISTRATOR)) === BigInt(ADMINISTRATOR) ||
      (permissions & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD)
    );
  });

  const guildsWithBotStatus = manageableGuilds.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    botIsIn: client.guilds.cache.has(g.id),
  }));

  res.json(guildsWithBotStatus);
});

/** جلب إعدادات سيرفر معين */
router.get('/guild/:guildId/config', ensureAuth, ensureGuildAdmin, (req, res) => {
  res.json(getConfig(req.params.guildId));
});

/** تفعيل/تعطيل الـ AutoMod */
router.post('/guild/:guildId/automod', ensureAuth, ensureGuildAdmin, async (req, res) => {
  const { enabled } = req.body;
  const updated = await saveConfig(req.params.guildId, { automodEnabled: !!enabled });
  res.json(updated);
});

/**
 * حفظ قايمة الكلمات الممنوعة كاملة (الفرونت إند بيبعت الأراي كله بعد أي تعديل)
 * body: { words: ["كلمة1", "كلمة2"] }
 */
router.post('/guild/:guildId/badwords', ensureAuth, ensureGuildAdmin, async (req, res) => {
  const { words } = req.body;

  if (!Array.isArray(words)) {
    return res.status(400).json({ error: 'لازم تبعت الكلمات كـ array' });
  }

  // تنضيف بسيط: شيل الفراغات والتكرار
  const cleaned = [...new Set(words.map((w) => String(w).trim()).filter(Boolean))];

  const updated = await saveConfig(req.params.guildId, { badWords: cleaned });
  res.json(updated);
});

module.exports = router;
