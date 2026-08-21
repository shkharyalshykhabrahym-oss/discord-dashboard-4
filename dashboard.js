const guildSelectScreen = document.getElementById('guild-select-screen');
const guildConfigScreen = document.getElementById('guild-config-screen');
const guildListEl = document.getElementById('guild-list');
const guildNameTitle = document.getElementById('guild-name-title');
const automodToggle = document.getElementById('automod-toggle');
const badwordsListEl = document.getElementById('badwords-list');
const newWordInput = document.getElementById('new-word-input');
const saveStatus = document.getElementById('save-status');

let currentGuildId = null;
let currentWords = [];

// ---------- تحميل قايمة السيرفرات ----------
async function loadGuilds() {
  const res = await fetch('/api/guilds');
  const guilds = await res.json();

  if (guilds.length === 0) {
    guildListEl.innerHTML = '<p>مفيش سيرفرات عندك صلاحية إدارة فيها.</p>';
    return;
  }

  guildListEl.innerHTML = '';
  guilds.forEach((g) => {
    const div = document.createElement('div');
    div.className = 'guild-card' + (g.botIsIn ? '' : ' disabled');
    const iconUrl = g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    div.innerHTML = `
      <img src="${iconUrl}" alt="${g.name}" />
      <div>${g.name}</div>
      <small>${g.botIsIn ? '✅ البوت موجود' : '⚠️ البوت مش هنا'}</small>
    `;

    if (g.botIsIn) {
      div.addEventListener('click', () => openGuildConfig(g.id, g.name));
    }
    guildListEl.appendChild(div);
  });
}

// ---------- فتح إعدادات سيرفر معين ----------
async function openGuildConfig(guildId, guildName) {
  currentGuildId = guildId;
  guildNameTitle.textContent = `⚙️ إعدادات: ${guildName}`;

  const res = await fetch(`/api/guild/${guildId}/config`);
  const config = await res.json();

  automodToggle.checked = !!config.automodEnabled;
  currentWords = config.badWords || [];
  renderBadWords();

  guildSelectScreen.classList.add('hidden');
  guildConfigScreen.classList.remove('hidden');
}

// ---------- عرض قايمة الكلمات الممنوعة ----------
function renderBadWords() {
  badwordsListEl.innerHTML = '';
  currentWords.forEach((word, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${word}</span> <button data-index="${index}">✕</button>`;
    badwordsListEl.appendChild(li);
  });
}

badwordsListEl.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const idx = Number(e.target.dataset.index);
    currentWords.splice(idx, 1);
    renderBadWords();
  }
});

document.getElementById('add-word-btn').addEventListener('click', addWord);
newWordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addWord();
});

function addWord() {
  const value = newWordInput.value.trim();
  if (value && !currentWords.includes(value)) {
    currentWords.push(value);
    renderBadWords();
  }
  newWordInput.value = '';
}

// ---------- حفظ التغييرات ----------
document.getElementById('save-btn').addEventListener('click', async () => {
  saveStatus.textContent = 'جاري الحفظ...';

  // احفظ حالة الـ automod toggle
  await fetch(`/api/guild/${currentGuildId}/automod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: automodToggle.checked }),
  });

  // احفظ قايمة الكلمات
  await fetch(`/api/guild/${currentGuildId}/badwords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words: currentWords }),
  });

  saveStatus.textContent = '✅ اتحفظ بنجاح! البوت هياخد التحديث فوراً';
  setTimeout(() => (saveStatus.textContent = ''), 3000);
});

// ---------- الرجوع لشاشة اختيار السيرفر ----------
document.getElementById('back-btn').addEventListener('click', () => {
  guildConfigScreen.classList.add('hidden');
  guildSelectScreen.classList.remove('hidden');
  loadGuilds();
});

loadGuilds();
