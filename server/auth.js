const passport = require('passport');
const { Strategy } = require('passport-discord');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ['identify', 'guilds'],
    },
    (accessToken, refreshToken, profile, done) => {
      // ممكن تحفظ الـ profile في الداتابيز هنا لو عايز تتبع المستخدمين
      process.nextTick(() => done(null, profile));
    }
  )
);

/** Middleware: يتأكد إن المستخدم مسجل دخول */
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/discord');
}

/**
 * Middleware: يتأكد إن المستخدم عنده صلاحية Administrator أو Manage Server
 * على السيرفر المحدد في الرابط (req.params.guildId)
 * ده مهم جداً أمنياً - من غيره أي حد مسجل دخول يقدر يعدل أي سيرفر
 */
function ensureGuildAdmin(req, res, next) {
  const { guildId } = req.params;
  const guild = req.user?.guilds?.find((g) => g.id === guildId);

  if (!guild) {
    return res.status(403).json({ error: 'السيرفر ده مش موجود عندك أو مش عضو فيه' });
  }

  const ADMINISTRATOR = 0x8;
  const MANAGE_GUILD = 0x20;
  const permissions = BigInt(guild.permissions);
  const hasAccess =
    (permissions & BigInt(ADMINISTRATOR)) === BigInt(ADMINISTRATOR) ||
    (permissions & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD);

  if (!hasAccess) {
    return res.status(403).json({ error: 'مالكش صلاحية تدير السيرفر ده' });
  }

  next();
}

module.exports = { passport, ensureAuth, ensureGuildAdmin };
