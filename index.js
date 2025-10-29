// --- GEREKLİ MODÜLLER ---
const express = require('express');
const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');

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

// --- SABİTLER ---
const OWNERS = ['923263340325781515', '1122942626702827621']; // sadece bu 2 ID reset/koruma bildirimi alır
const OWNER_LABEL = {
  '923263340325781515': 'hayhay sagi bey',
  '1122942626702827621': 'hayhay lunar bey'
};
const SOHBET_KANAL_ID = '1413929200817148104'; // sohbet liderliği ve koruma için kanal

// --- SES TAKİBİ ---
const joinTimes = new Map(); // gid:uid -> startedAt(ms)
const totals = new Map();    // gid:uid -> seconds

const key = (gid, uid) => `${gid}:${uid}`;
const formatTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}sa ${m}dk ${s}sn`;
};

client.on('voiceStateUpdate', (oldState, newState) => {
  const guildId = newState.guild?.id || oldState.guild?.id;
  const userId = newState.id;
  if (!guildId || !userId) return;

  const k = key(guildId, userId);
  const wasIn = oldState.channelId;
  const nowIn = newState.channelId;

  // Ayrıldıysa süre ekle
  if (wasIn && !nowIn && joinTimes.has(k)) {
    const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    totals.set(k, (totals.get(k) || 0) + diff);
    joinTimes.delete(k);
  }

  // Girdiyse zamanı kaydet
  if (!wasIn && nowIn) {
    joinTimes.set(k, Date.now());
  }
});

// --- MESAJ SAYACI (SOHBET LİDERLİĞİ) ---
const messageCount = new Map(); // gid:cid:uid -> count
const msgKey = (gid, cid, uid) => `${gid}:${cid}:${uid}`;

// --- BOTA YANIT: anahtar kelime cevapları ---
async function handleReplyReactions(message) {
  const refId = message.reference?.messageId;
  if (!refId) return;

  let replied;
  try {
    replied = await message.channel.messages.fetch(refId);
  } catch {
    return;
  }
  if (!replied || replied.author.id !== client.user.id) return;

  const txt = message.content.toLocaleLowerCase('tr');

  if (txt.includes('teşekkürler sen')) {
    return void message.reply('iyiyim teşekkürler babuş👻');
  }
  if (txt.includes('teşekkürler')) {
    return void message.reply('rica ederim babuş👻');
  }
  if (txt.includes('yapıyorsun bu sporu')) {
    return void message.reply('yerim seni kız💎💎');
  }
}

// --- MESAJ EVENTİ ---
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;

  // Sohbet liderliği: sadece belirlenen kanalı say
  if (gid && cid === SOHBET_KANAL_ID && uid) {
    const k = msgKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
  }

  // Bota yanıt ise özel cevaplar
  await handleReplyReactions(message);

  // Bot mention: tek kez cevap
  if (message.mentions.users.has(client.user.id)) {
    if (client.lastReplyId === message.id) return;
    client.lastReplyId = message.id;
    message.reply('naber babuş 👻');
  }

  // --- SES LİDERLİĞİ (!ses)
  if (message.content.toLowerCase() === '!ses') {
    if (!gid) return;
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
    return void message.reply(`🎙️ **Ses Liderliği Paneli**\n${lines.join('\n')}`);
  }

  // --- KİŞİSEL SES SÜRESİ (!sesme)
  if (message.content.toLowerCase() === '!sesme') {
    if (!gid) return;
    const k = key(gid, uid);
    let totalSec = totals.get(k) || 0;
    if (joinTimes.has(k)) {
      const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
      totalSec += diff;
    }
    if (totalSec === 0) return message.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    return void message.reply(`🎧 **${message.author.username}**, toplam ses süren: **${formatTime(totalSec)}** ⏱️`);
  }

  // --- SOHBET LİDERLİĞİ (!sohbet)
  if (message.content.toLowerCase() === '!sohbet') {
    if (!gid) return;
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
    return void message.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${lines.join('\n')}`);
  }

  // --- SES SIFIRLAMA (!ses-sifirla) — sadece OWNERS
  if (message.content.toLowerCase() === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) {
      return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    if (gid) {
      for (const k of [...totals.keys()]) if (k.startsWith(`${gid}:`)) totals.delete(k);
      for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    }
    return void message.reply(`🎙️ ${label} — Ses liderliği ve bireysel süreler sıfırlandı!`);
  }

  // --- SOHBET SIFIRLAMA (!sohbet-sifirla) — sadece OWNERS
  if (message.content.toLowerCase() === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) {
      return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    if (gid) {
      for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    }
    return void message.reply(`💬 ${label} — Sohbet liderliği sıfırlandı!`);
  }
});

// --- KANAL KORUMA: sohbet kanalı silinirse sileni kickle + owner’lara DM ---
client.on('channelDelete', async (channel) => {
  try {
    // Sadece hedef sohbet kanalını koruyoruz
    if (channel?.id !== SOHBET_KANAL_ID) return;
    const guild = channel.guild;
    if (!guild) return;

    // Audit Log'dan son Kanal Silme kaydını çek
    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return;

    // Hedef gerçekten bu kanal mı?
    if (entry.target?.id !== channel.id) return;

    const executor = entry.executor; // kanalı silen kişi
    if (!executor) return;

    // Owner'lar silerse işlem yapma
    if (OWNERS.includes(executor.id)) return;

    // Üyeyi kickle (yetki lazım: Kick Members)
    let kicked = false;
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (member && member.kickable) {
      await member.kick('Koruma: sohbet kanalını izinsiz silme.');
      kicked = true;
    }

    // Owner'lara DM at
    const info = `⚠️ **Kanal Koruma**\nSilinen kanal: <#${SOHBET_KANAL_ID}> (${SOHBET_KANAL_ID})\nSilen: ${executor.tag || executor.id}\nİşlem: ${kicked ? 'Kick atıldı ✅' : 'Kick atılamadı ⛔ (yetki yetersiz olabilir)'}`;
    for (const id of OWNERS) {
      try {
        const u = await client.users.fetch(id);
        await u.send(info);
      } catch {}
    }
  } catch (err) {
    console.error('channelDelete koruma hatası:', err);
  }
});

// --- BOT AKTİF OLDUĞUNDA ---
client.once('ready', () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
});

// --- TOKEN ---
client.login(process.env.TOKEN);
