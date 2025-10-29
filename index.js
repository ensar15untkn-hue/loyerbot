const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.get('/', (_, res) => res.send('Bot aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web sunucusu çalışıyor.'));

// 👇 BURADAN SONRASINA EKLE (benim kodum buraya)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

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

  // kanaldan çıkarsa süreyi topla
  if (wasIn && !nowIn && joinTimes.has(k)) {
    const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    totals.set(k, (totals.get(k) || 0) + diff);
    joinTimes.delete(k);
  }

  // kanala girerse zamanı kaydet
  if (!wasIn && nowIn) {
    joinTimes.set(k, Date.now());
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  // Etiketlenince cevap
  if (message.mentions.users.has(client.user.id)) {
    message.reply('naber babuş 👻');
  }

  // !ses komutu → sıralama
  if (message.content.toLowerCase() === '!ses') {
    const gid = message.guild?.id;
    if (!gid) return;

    const data = [];
    for (const [k, sec] of totals) {
      if (k.startsWith(`${gid}:`)) {
        const uid = k.split(':')[1];
        data.push({ uid, sec });
      }
    }

    if (data.length === 0) return message.reply('Henüz kimse ses kanalına girmemiş.');

    data.sort((a, b) => b.sec - a.sec);
    const top = data.slice(0, 10);
    const lines = top.map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`);

    message.reply(`🎙️ **Ses Liderliği**\n${lines.join('\n')}`);
  }
});

// 👇 En altta bu zaten var, dokunma:
client.login(process.env.TOKEN);

