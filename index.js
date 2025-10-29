// --- GEREKLİ MODÜLLER ---
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

// --- WEB SUNUCUSU (Render için) ---
const app = express();
app.get('/', (_, res) => res.send('Bot aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web sunucusu çalışıyor.'));

// --- DİSCORD BOT AYARLARI ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// --- SABİT DEĞERLER ---
const SAHIP_ISIM = 'sağimokhtari'; // sadece bu kullanıcı sıfırlama yapabilir
const SOHBET_KANAL_ID = '1413929200817148104'; // sohbet kanalının ID’si

// --- SES TAKİBİ ---
const joinTimes = new Map();
const totals = new Map();

function key(gid, uid) {
  return `${gid}:${uid}`;
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}sa ${m}dk ${s}sn`;
}

client.on('voiceStateUpdate', (oldState, newState) => {
  const guildId = newState.guild?.id || oldState.guild?.id;
  const userId = newState.id;
  if (!guildId || !userId) return;

  const k = key(guildId, userId);
  const wasIn = oldState.channelId;
  const nowIn = newState.channelId;

  if (wasIn && !nowIn && joinTimes.has(k)) {
    const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    totals.set(k, (totals.get(k) || 0) + diff);
    joinTimes.delete(k);
  }

  if (!wasIn && nowIn) {
    joinTimes.set(k, Date.now());
  }
});

// --- MESAJ SAYACI (SOHBET LİDERLİĞİ) ---
const messageCount = new Map();
function msgKey(gid, cid, uid) {
  return `${gid}:${cid}:${uid}`;
}

// --- MESAJ EVENTİ ---
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;

  // --- Sohbet kanalındaki mesajları say ---
  if (gid && cid === SOHBET_KANAL_ID && uid) {
    const k = msgKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
  }

  // --- Bot etiketlenince sadece 1 kez cevap versin ---
  if (message.mentions.users.has(client.user.id)) {
    if (client.lastReplyId === message.id) return;
    client.lastReplyId = message.id;
    message.reply('naber babuş 👻');
  }

  // --- SES LİDERLİĞİ (!ses) ---
  if (message.content.toLowerCase() === '!ses') {
    const data = [];
    for (const [k, sec] of totals) {
      if (k.startsWith(`${gid}:`)) {
        const uid = k.split(':')[1];
        data.push({ uid, sec });
      }
    }
    if (data.length === 0) return message.reply('Ses kanalları bomboş... yankı bile yok 😴');

    data.sort((a, b) => b.sec - a.sec);
    const top = data.slice(0, 10);
    const lines = top.map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`);
    message.reply(`🎙️ **Ses Liderliği Paneli**\n${lines.join('\n')}`);
  }

  // --- KİŞİSEL SES SÜRESİ (!sesme) ---
  if (message.content.toLowerCase() === '!sesme') {
    const keyVal = `${gid}:${uid}`;
    let totalSec = totals.get(keyVal) || 0;
    if (joinTimes.has(keyVal)) {
      const diff = Math.floor((Date.now() - joinTimes.get(keyVal)) / 1000);
      totalSec += diff;
    }

    if (totalSec === 0) return message.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    message.reply(`🎧 **${message.author.username}**, toplam ses süren: **${formatTime(totalSec)}** ⏱️`);
  }

  // --- SOHBET LİDERLİĞİ (!sohbet) ---
  if (message.content.toLowerCase() === '!sohbet') {
    const data = [];
    for (const [k, count] of messageCount) {
      if (k.startsWith(`${gid}:${SOHBET_KANAL_ID}:`)) {
        const uid = k.split(':')[2];
        data.push({ uid, count });
      }
    }

    if (data.length === 0) return message.reply('Bu kanalda henüz mesaj yazılmamış 💤');
    data.sort((a, b) => b.count - a.count);
    const top = data.slice(0, 10);
    const lines = top.map((r, i) => `**${i + 1}.** <@${r.uid}> — ${r.count} mesaj`);
    message.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${lines.join('\n')}`);
  }

  // --- SES SIFIRLAMA (!ses-sifirla) ---
  if (message.content.toLowerCase() === '!ses-sifirla') {
    if (message.author.username !== SAHIP_ISIM) {
      return message.reply('Bu komutu sadece bot sahibi kullanabilir ⚠️');
    }

    for (const k of [...totals.keys()]) if (k.startsWith(`${gid}:`)) totals.delete(k);
    for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);

    message.reply('🎙️ Ses liderliği ve bireysel süreler sıfırlandı!');
  }

  // --- SOHBET SIFIRLAMA (!sohbet-sifirla) ---
  if (message.content.toLowerCase() === '!sohbet-sifirla') {
    if (message.author.username !== SAHIP_ISIM) {
      return message.reply('Bu komutu sadece bot sahibi kullanabilir ⚠️');
    }

    for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);

    message.reply('💬 Sohbet liderliği sıfırlandı!');
  }
});

// --- BOT AKTİF OLDUĞUNDA ---
client.once('ready', () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
});

// --- TOKEN ---
client.login(process.env.TOKEN);


