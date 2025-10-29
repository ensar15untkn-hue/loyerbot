// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');

// ====================== WEB SUNUCUSU (Render) =================
const app = express();
app.get('/', (_, res) => res.send('Bot aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web sunucusu çalışıyor'));

// ====================== BOT OLUŞTUR ===========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ====================== SABİTLER ===============================
const OWNERS = ['923263340325781515', '1122942626702827621']; // Sagi & Lunar
const OWNER_LABEL = {
  '923263340325781515': 'hayhay sagi bey',
  '1122942626702827621': 'hayhay lunar bey'
};

// Sohbet liderliği kanalı + !salla izinli kanallar
const SOHBET_KANAL_ID = '1413929200817148104';
const SALLA_ALLOWED_CHANNELS = new Set([
  '1413929200817148104',
  '1268595926226829404',
  '1268595980727746574'
]);

// !salla metinleri (20 adet)
const SALLA_TEXTS = [
  'Biliyor muydun? Zürafalar, kulaklarını temizlemek için kendi dillerini kullanabilirler. Bu, yaklaşık 50 cm\'lik biyolojik bir kulak çubuğu demek.',
  'Ortalama bir insan hayatı boyunca, sadece yastığının altına düşen uzak kumandaların sayısını saysa, bir daha uyuyamazdı.',
  'Eğer tüm kağıt ataçları uç uca eklenseydi, muhtemelen kimse neden bu kadar çok kağıt ataç biriktirdiğimizi sorgulamazdı.',
  'Bir ördek sesi yankı yapmaz. Bilim insanları bunun nedenini biliyor ama sana söylemiyorlar. (Büyük bir ördek komplosu!)',
  'Tavuklar, tehlike hissettiklerinde, 3 saniyeliğine geçmişe ışınlanma yeteneğine sahiptir. Genelde sadece 3 saniye geri giderler, bu yüzden kimse fark etmez.',
  'Tokyo\'daki bir araştırma, kedilerin aslında dünyanın en iyi gizlenmiş ninja klanı olduğunu ortaya çıkardı. O kadar sessizler ki!',
  'Gezegenimizdeki karıncaların toplam ağırlığı, tüm insanların toplam ağırlığından daha fazladır. Yani teknik olarak karıncalar bizi taşıyor.',
  'Peynir, gece yenirse tuhaf rüyalar görme olasılığını ciddi oranda artırır. Özellikle de "koşan turp" rüyaları.',
  'Bir bulut, ortalama olarak bir filler sürüsü kadar ağırdır. Sadece havada asılı kalma konusunda bizden daha iyiler.',
  'Muzlar aslında meyve değil, ottur. Yani sabah kahvaltısında "meyve" yiyorum derken, teknik olarak "uzun boylu ot" yiyorsun.',
  'Bir salyangoz, arka arkaya üç yıla kadar uyuyabilir. Çünkü bazen tüm o sümük izlerini temizlemek yorucu olabiliyor.',
  'Eğer bir yengeç seni işaret ederse, bunun anlamı "Şşşt... Senin ayakkabının bağı çözülmüş!" demektir.',
  'Ortalama bir insan, hayatının altı ayını sadece televizyon kumandasını arayarak geçirir. Ve genelde kanepenin altından çıkar.',
  'İngiltere\'de, yünlü bir ceket giyen koyun hırsızlarının cezası, ceketin içinde gün batımına kadar bekleme zorunluluğuydu.',
  'Bir timsah, dilini dışarı çıkaramaz. Muhtemelen bu yüzden her zaman sinirli görünüyorlar.',
  'Dünyadaki her dördüncü insandan biri, tuvalette telefonunu düşürme korkusuyla yaşıyor. Diğer üçü ise çoktan düşürdü.',
  'Bir karidesin kalbi kafasında bulunur. Bu da demek oluyor ki, "kalbim kafamda" dediğinde, sadece karides gibi hissediyorsun.',
  'Gözleriniz, her zaman burnunuzun bir kısmını görür, ama beyniniz bunu görmezden gelmek üzere eğitilmiştir. (Şimdi fark ettin, değil mi?)',
  'İnsanların ortalama olarak %10\'u, her gece bir süper kahraman olduklarını rüyalarında görüyor. Sabah uyandıklarında ise yine sadece yorgunlar.',
  'Eğer sabahları uyandığınızda ne kadar yorgun olduğunuzu düşünen bir bot olsaydım, muhtemelen size bir kupa kahve emojisi gönderirdim. ☕'
];

// Küçük yardımcılar
const tLower = (s) => s?.toLocaleLowerCase('tr') || '';

// ====================== SES TAKİBİ =============================
const joinTimes = new Map(); // gid:uid -> startedAt(ms)
const totals    = new Map(); // gid:uid -> seconds
const vKey = (gid, uid) => `${gid}:${uid}`;
const formatTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}sa ${m}dk ${s}sn`;
};

client.on('voiceStateUpdate', (oldState, newState) => {
  const guildId = newState.guild?.id || oldState.guild?.id;
  const userId  = newState.id;
  if (!guildId || !userId) return;

  const k = vKey(guildId, userId);
  const was = oldState.channelId;
  const now = newState.channelId;

  if (was && !now && joinTimes.has(k)) {
    const diff = Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    totals.set(k, (totals.get(k) || 0) + diff);
    joinTimes.delete(k);
  }
  if (!was && now) joinTimes.set(k, Date.now());
});

// ====================== SOHBET SAYACI ==========================
const messageCount = new Map(); // gid:cid:uid -> count
const mKey = (gid, cid, uid) => `${gid}:${cid}:${uid}`;

// ====================== REPLY ÖZEL CEVAPLAR ====================
async function handleReplyReactions(message) {
  const refId = message.reference?.messageId;
  if (!refId) return;

  const replied = await message.channel.messages.fetch(refId).catch(() => null);
  if (!replied || replied.author.id !== client.user.id) return;

  const txt = tLower(message.content);
  if (txt.includes('teşekkürler sen'))     return void message.reply('iyiyim teşekkürler babuş👻');
  if (txt.includes('teşekkürler'))         return void message.reply('rica ederim babuş👻');
  if (txt.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
  if (txt.includes('naber babuş'))         return void message.reply('iyiyim sen babuş👻');
  if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return void message.reply('süper hep iyi ol ⭐');
}

// ====================== MESAJ OLAYI ============================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  // Sohbet liderliği sayacı (sadece belirlenen kanal)
  if (gid && cid === SOHBET_KANAL_ID) {
    const k = mKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
  }

  // Bota YANIT özel cevapları (selam YOK)
  await handleReplyReactions(message);

  // ----------- BOT MENTION -----------
  if (message.mentions.users.has(client.user.id)) {
    // Özel cümleler mention ile gelirse sadece bunlara cevap ver (selam yok)
    if (txt.includes('teşekkürler sen'))     return void message.reply('iyiyim teşekkürler babuş👻');
    if (txt.includes('teşekkürler'))         return void message.reply('rica ederim babuş👻');
    if (txt.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
    if (txt.includes('naber babuş'))         return void message.reply('iyiyim sen babuş👻');
    if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return void message.reply('süper hep iyi ol ⭐');

    // Sadece @bot yazıldıysa (başka metin yoksa) "naber babuş 👻" — her seferinde
    const onlyMention = message.content.replace(/<@!?\d+>/g, '').trim().length === 0;
    if (onlyMention) return void message.reply('naber babuş 👻');

    // Mention + metin var ama özel cümle yoksa: sessiz
  }

  // ----------- KOMUTLAR -----------
  // !salla (sadece izinli kanallar)
  if (txt === '!salla') {
    if (!cid || !SALLA_ALLOWED_CHANNELS.has(cid)) return; // izinli değilse sessizce yok say
    const pick = SALLA_TEXTS[Math.floor(Math.random() * SALLA_TEXTS.length)];
    return void message.reply(pick);
  }

  // Ses Liderliği
  if (txt === '!ses') {
    if (!gid) return;
    const data = [];
    for (const [k, sec] of totals) if (k.startsWith(`${gid}:`)) data.push({ uid: k.split(':')[1], sec });
    if (!data.length) return message.reply('Ses kanalları bomboş... yankı bile yok 😴');
    data.sort((a, b) => b.sec - a.sec);
    const top = data.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`).join('\n');
    return void message.reply(`🎙️ **Ses Liderliği Paneli**\n${top}`);
  }

  // Kişisel Ses Süresi
  if (txt === '!sesme') {
    if (!gid) return;
    const k = vKey(gid, uid);
    let totalSec = totals.get(k) || 0;
    if (joinTimes.has(k)) totalSec += Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    if (!totalSec) return message.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    return void message.reply(`🎧 **${message.author.username}**, toplam ses süren: **${formatTime(totalSec)}** ⏱️`);
  }

  // Sohbet Liderliği
  if (txt === '!sohbet') {
    if (!gid) return;
    const arr = [];
    for (const [k, count] of messageCount) {
      if (k.startsWith(`${gid}:${SOHBET_KANAL_ID}:`)) arr.push({ uid: k.split(':')[2], count });
    }
    if (!arr.length) return message.reply('Bu kanalda henüz mesaj yazılmamış 💤');
    arr.sort((a, b) => b.count - a.count);
    const top = arr.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${r.count} mesaj`).join('\n');
    return void message.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${top}`);
  }

  // Yalnız OWNERS → Ses Sıfırla
  if (txt === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) {
      for (const k of [...totals.keys()])    if (k.startsWith(`${gid}:`)) totals.delete(k);
      for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`🎙️ ${label} — Ses verileri sıfırlandı!`);
  }

  // Yalnız OWNERS → Sohbet Sıfırla
  if (txt === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`💬 ${label} — Sohbet liderliği sıfırlandı!`);
  }
});

// ====================== KANAL KORUMA ===========================
client.on('channelDelete', async (channel) => {
  try {
    if (channel?.id !== SOHBET_KANAL_ID) return;
    const guild = channel.guild;
    if (!guild) return;

    // Audit log biraz gecikebilir
    await new Promise(r => setTimeout(r, 1500));

    let executor = null;
    try {
      const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === channel.id) executor = entry.executor || null;
    } catch (e) {
      console.error('Audit log okunamadı:', e);
    }

    let kickResult = 'Belirsiz';
    if (executor && !OWNERS.includes(executor.id)) {
      try {
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member && member.kickable) {
          await member.kick('Koruma: sohbet kanalını izinsiz silme.');
          kickResult = 'Kick atıldı ✅';
        } else {
          kickResult = 'Kick atılamadı ⛔ (yetki / hiyerarşi / bulunamadı)';
        }
      } catch (e) {
        kickResult = 'Kick denemesi hatası ⛔';
        console.error('Kick hatası:', e);
      }
    } else if (executor && OWNERS.includes(executor.id)) {
      kickResult = 'Owner sildi, işlem yok';
    } else {
      kickResult = 'Silen tespit edilemedi ⛔ (audit log gecikmesi / izin)';
    }

    const info =
      `⚠️ **Kanal Koruma**\n` +
      `Silinen kanal: <#${SOHBET_KANAL_ID}> (${SOHBET_KANAL_ID})\n` +
      `Silen: ${executor ? (executor.tag || executor.id) : 'bilinmiyor'}\n` +
      `İşlem: ${kickResult}`;

    for (const id of OWNERS) {
      try { const u = await client.users.fetch(id); await u.send(info); } catch {}
    }
  } catch (err) {
    console.error('channelDelete koruma hatası:', err);
  }
});

// ====================== READY / HATA LOG =======================
client.once('ready', () => console.log(`✅ Bot aktif: ${client.user.tag}`));
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));

// ====================== LOGIN =================================
client.login(process.env.TOKEN);
