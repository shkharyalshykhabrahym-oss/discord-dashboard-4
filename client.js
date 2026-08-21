const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const { getConfig } = require('../configCache');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`🤖 البوت شغال باسم ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const config = getConfig(message.guild.id);
  if (!config.automodEnabled) return;
  if (config.whitelistedChannels?.includes(message.channel.id)) return;
  if (!config.badWords || config.badWords.length === 0) return;

  const content = message.content.toLowerCase();
  const matchedWord = config.badWords.find((word) =>
    content.includes(word.toLowerCase())
  );

  if (matchedWord) {
    try {
      // اتأكد إن البوت عنده صلاحية حذف الرسائل الأول
      const me = message.guild.members.me;
      if (me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.delete();
      }

      const warning = await message.channel.send(
        `🚫 ${message.author}, الرسالة اتشالت لأنها فيها كلمة ممنوعة.`
      );
      // امسح رسالة التحذير بعد ٥ ثواني عشان ميبقاش فيه سبام
      setTimeout(() => warning.delete().catch(() => {}), 5000);

      // لو فيه لوج تشانل محدد، ابعت تفاصيل الحدث فيه
      if (config.logChannelId) {
        const logChannel = message.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          logChannel.send(
            `⚠️ **AutoMod**: ${message.author.tag} كتب كلمة ممنوعة في <#${message.channel.id}>`
          );
        }
      }
    } catch (err) {
      console.error('خطأ في حذف الرسالة أو إرسال التحذير:', err.message);
    }
  }
});

module.exports = client;
