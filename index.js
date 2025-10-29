const express = require('express');
const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');

const app = express();
app.get('/', (_, res) => res.send('Bot aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web sunucusu çalışıyor'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const OWNERS = ['923263340325781515', '1122942626702827621'];
const OWNER_LABEL = {
  '923263340325781515': 'hayhay sagi bey',
  '1122942626702827621': 'hayhay lunar bey'
};
const SOHBET_KANAL_ID = '1413929200817148104';

const mentionCooldown = new Map();
const greetedOnce = new Set();

function isOnlyBotMention(message, botId) {
  const withoutMentions = message.content.replace(/<@!?\d+>/g, '').trim();
  return message.mentions.users.has(botId) && withoutMentions.length === 0;
}

const joinTimes = new Map();
const totals = new Map();
const vKey = (gid, uid) => `${gid}:${uid}`;
const formatTime = (s) => `${Math.floor(s / 3600)}sa ${Math.floor((s % 3600) / 60)}dk ${s % 60}sn`;

client.on('voiceStateUpdate', (o, n) => {
  const gid = n.guild?.id || o.guild?.id, uid = n.id;
  if (!gid || !uid) return;
  const k = vKey(gid, uid);
  if (o.channelId && !n.channelId && joinTimes.has(k)) {
    const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    totals.set(k, (totals.get(k) || 0) + diff);
    joinTimes.delete(k);
  }
  if (!o.channelId && n.channelId) joinTimes.set(k, Date.now());
});

const messageCount = new Map();
const mKey = (gid, cid, uid) => `${gid}:${cid}:${uid}`;

client.on('messageCreate', async (m) => {
  if (m.author.bot) return;
  const gid = m.guild?.id, cid = m.channel?.id, uid = m.author.id;
  if (gid && cid === SOHBET_KANAL_ID) {
    const k = mKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
  }

  const txt = m.content.toLowerCase();

  // ---- Mention sistem ----
  if (m.mentions.users.has(client.user.id)) {
    // 1️⃣ özel kelimeler (mention veya yanıt)
    if (txt.includes('teşekkürler sen')) return m.reply('iyiyim teşekkürler babuş👻');
    if (txt.includes('teşekkürler')) return m.reply('rica ederim babuş👻');
    if (txt.includes('yapıyorsun bu sporu')) return m.reply('yerim seni kız💎💎');
    if (txt.includes('naber babuş')) return m.reply('iyiyim sen babuş👻');
    if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return m.reply('süper hep iyi ol ⭐');

    // 2️⃣ yanıt bota ise selam atma
    if (m.reference?.messageId) {
      const rep = await m.channel.messages.fetch(m.reference.messageId).catch(() => null);
      if (rep && rep.author.id === client.user.id) return;
    }

    // 3️⃣ sadece @bot yazılmışsa 1 defa selam
    if (!isOnlyBotMention(m, client.user.id)) return;
    if (greetedOnce.has(uid)) return;
    greetedOnce.add(uid);

    const now = Date.now(), last = mentionCooldown.get(uid) || 0;
    if (now - last < 10_000) return;
    mentionCooldown.set(uid, now);

    return m.reply('naber babuş 👻');
  }

  // ---- Komutlar ----
  if (txt === '!ses') {
    const data = [...totals.entries()]
      .filter(([k]) => k.startsWith(`${gid}:`))
      .map(([k, sec]) => ({ uid: k.split(':')[1], sec }))
      .sort((a, b) => b.sec - a.sec);
    if (!data.length) return m.reply('Ses kanalları bomboş... yankı bile yok 😴');
    return m.reply(`🎙️ **Ses Liderliği Paneli**\n${data.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`).join('\n')}`);
  }

  if (txt === '!sesme') {
    const k = vKey(gid, uid);
    let t = totals.get(k) || 0;
    if (joinTimes.has(k)) t += Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    if (!t) return m.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    return m.reply(`🎧 ${m.author.username}, toplam ses süren: **${formatTime(t)}** ⏱️`);
  }

  if (txt === '!sohbet') {
    const d = [...messageCount.entries()]
      .filter(([k]) => k.startsWith(`${gid}:${SOHBET_KANAL_ID}:`))
      .map(([k, c]) => ({ uid: k.split(':')[2], c }))
      .sort((a, b) => b.c - a.c);
    if (!d.length) return m.reply('Bu kanalda henüz mesaj yazılmamış 💤');
    return m.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${d.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${r.c} mesaj`).join('\n')}`);
  }

  if (txt === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) return m.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    for (const k of [...totals.keys()]) if (k.startsWith(`${gid}:`)) totals.delete(k);
    for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    return m.reply(`🎙️ ${OWNER_LABEL[uid]} — Ses verileri sıfırlandı!`);
  }

  if (txt === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) return m.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    return m.reply(`💬 ${OWNER_LABEL[uid]} — Sohbet liderliği sıfırlandı!`);
  }
});

// ---- Kanal koruma ----
client.on('channelDelete', async (ch) => {
  if (ch.id !== SOHBET_KANAL_ID) return;
  const g = ch.guild;
  const logs = await g.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
  const e = logs.entries.first();
  if (!e || e.target?.id !== ch.id) return;
  const exec = e.executor;
  if (!exec || OWNERS.includes(exec.id)) return;
  const m = await g.members.fetch(exec.id).catch(() => null);
  if (m && m.kickable) await m.kick('Koruma: sohbet kanalını izinsiz silme.');
  const info = `⚠️ **Kanal Koruma**\nSilinen kanal: ${ch.name}\nSilen: ${exec.tag}`;
  for (const id of OWNERS) {
    try { const u = await client.users.fetch(id); await u.send(info); } catch {}
  }
});

client.once('ready', () => console.log(`✅ Bot aktif: ${client.user.tag}`));
client.login(process.env.TOKEN);

