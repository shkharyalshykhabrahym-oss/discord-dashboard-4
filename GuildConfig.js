const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    automodEnabled: { type: Boolean, default: true },
    badWords: { type: [String], default: [] },
    // ممكن تضيف حقول تانية هنا زي: logChannelId, muteRoleId, whitelistedChannels ...الخ
    logChannelId: { type: String, default: null },
    whitelistedChannels: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
