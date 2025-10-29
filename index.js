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

// Sohbet liderliği kanalı
const SOHBET_KANAL_ID = '1413929200817148104';

// !espiri metinleri (30 adet) — bilgilendirici ama komik
const ESPIRI_TEXTS = [
  'Bilim insanları diyor ki: Uykusuzluk hafızayı bozar. Ben de o yüzden dün gece… ne diyordum ben?',
  'Bir balinanın kalbi insan kadar ağır olabilir. Yani kalbi kırılan tek tür biz değiliz.',
  'Işık sesten hızlıdır; o yüzden bazı insanlar parlak görünür ama konuşunca her şey ortaya çıkar.',
  'Arılar dans ederek haberleşir. Ben de kahve içince benzer bir protokole geçiyorum: titreyerek anlaşıyorum.',
  'Mars’ta gün 24 saat 39 dakikadır. Yani geç kalmalarım bilimsel temellidir hocam.',
  'İnsan beyni günde yaklaşık 60 bin düşünce üretir. Benimkiler genelde “şifre neydi?” ile meşgul.',
  'Ahtapotların üç kalbi vardır. Benimki ise fatura gününde üç kez duruyor.',
  'Kediler günde 12–16 saat uyur. Verimlilik tanrıları şu an gözyaşı döküyor.',
  'Muzlar hafif radyoaktiftir; en tehlikelisi ısırıldığında biten potasyum olabilir.',
  'Satürn suya konsa yüzerdi. Keşke bütçem de bu kadar hafif olsa.',
  'Tavuklar insan yüzlerini ayırt edebilir. Market çıkışında indirimi kim yakalamış, biliyorlar.',
  'Şimşek, Güneş yüzeyinden daha sıcaktır. Ama elektrik faturasını görünce ben soğuyorum.',
  'Sümüklüböceklerin tuzla arası iyi değildir. Benim de ay sonuyla.',
  'Yunuslar isimleriyle çağrılabilir. Benim çağrıma sadece Wi‑Fi cevap veriyor.',
  'Yıldızlar gördüğünde geçmişi görürsün. Spor salonunda da geçmiş formumu arıyorum.',
  'Japonya’daki makineler kola verir, kalbim ise umut… bazen bozuk para üstünü veremiyor.',
  'Karıncalar ağırlıklarının katlarını kaldırabilir. Ben de dertlerimin… bazen kaldıramıyorum.',
  'Kahve, performansı artırır; bende artırdığı şey konuşma hızım.',
  'İnsan vücudundaki kemiklerin yarısı eller ve ayaklardadır. Benim kodlarımın yarısı ise yorum satırı.',
  'Suyun %70’i Dünya’yı kaplar; kalan %30’u WhatsApp grupları.',
  'Bal arıları dans ederek yön tarif eder. Ben Google Maps ile bile kayboluyorum.',
  'Zürafaların ses telleri var ama nadir kullanırlar. Ben de alarmı kapatınca öyleyim.',
  'Kutup ayılarının derisi siyahtır; ben de faturaları görünce kararıyorum.',
  'Dünya her saniye 11 kilometre hızla döner; iş günü ise yerinde sayıyor gibi.',
  'Bir bulut tonlarca ağırlık taşıyabilir; ben ise “son bir bölüm daha”yı.',
  'Soğan doğrarken göz yaşartır; dolar kurunu görünce de etkisi benzer.',
  'Timsahlar dili dışarı çıkaramaz; ben de diyete başlayamıyorum.',
  'Gözlerimiz burnumuzu görür ama beyin filtreler; ben de hataları prod’da fark ediyorum.',
  'Kelebekler ayaklarıyla tat alır; ben aklımla tatlıyı haklı çıkarıyorum.',
  'Ay’da rüzgâr yok; bayraklar yine de gönlümüzde dalgalanıyor.'
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
  // Mention geldiyse bu fonksiyon çalışmasın (çift yanıtı önler)
  if (message.mentions?.users?.has?.(client.user.id)) return;

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

  // ----------- KOMUTLAR (ÖNCE) -----------
  // !espiri (tüm kanallar) — 30 espriden 1 tanesini söyler
  if (txt.trim() === '!espiri') {
    const joke = ESPIRI_TEXTS[Math.floor(Math.random() * ESPIRI_TEXTS.length)];
    return void message.reply(joke);
  }

  // 🎲 Yazı Tura
  if (txt === '!yazıtura' || txt === '!yazi-tura' || txt === '!yazı-tura') {
    const sonuc = Math.random() < 0.5 ? '🪙 **YAZI** geldi!' : '🪙 **TURA** geldi!';
    return void message.reply(`${sonuc} 🎲`);
  }

  // 🎲 Zar Oyunu — !zar üst|alt
  // Kural: 1-3 = alt, 4-6 = üst. Örnek: !zar üst
  if (txt.startsWith('!zar')) {
    const parts = txt.trim().split(/\s+/);
    const secimRaw = parts[1] || '';
    const secim = secimRaw.replace('ust','üst'); // ust -> üst normalize
    if (!['üst','alt'].includes(secim)) {
      return void message.reply('Kullanım: `!zar üst` veya `!zar alt`\nKural: **1-3 = alt**, **4-6 = üst**');
    }

    const roll = Math.floor(Math.random() * 6) + 1; // 1..6
    const sonuc = roll <= 3 ? 'alt' : 'üst';
    const kazandi = secim === sonuc;

    const text = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}**\n${kazandi ? 'Kazandın 🎉' : 'Kaybettin 😿 ama ağlamayacaksın babuş, hakkını veririz.'}`;
    return void message.reply(text);
  }

  // 💡 Yardım komutu — basit anlatım (owner komutları hariç)
  if (txt === '!yardım' || txt === '!help') {
    const helpText = `\n📘 **Babuş'un Komut Rehberi**  \n\n🎭 **!espiri** — Sana rastgele komik ve bilgilendirici bir espri söyler.\n🎲 **!yazıtura** — Yazı mı Tura mı? Şansını dene babuş!\n🎯 **!zar üst / !zar alt** — Zar atılır. 1-3 alt, 4-6 üst. Kazanırsın ya da... kaybedersen ağlama, hakkını veririz. 😎\n🎙️ **!ses** — Sunucuda en çok seste kalanların listesi.\n🎧 **!sesme** — Senin toplam seste kalma süreni gösterir.\n💬 **!sohbet** — Sohbet kanalında en çok yazanları gösterir.\n👻 **@bot** — Etiketlersen seninle konuşur. “@bot naber babuş” falan yaz, keyfine bak.\n☀️ **@bot günaydın** — Sabah enerjisiyle yüzünü yıkamayı hatırlatır.\n🌙 **@bot iyi akşamlar** — Gece olunca üstünü örtmeni söyler (romantik dokunuşla).\n\n> 🔒 Owner komutlarını boşver babuş, onlar teknik işler 😏\n`;
    return void message.reply(helpText);
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
    if (/(günaydın|gunaydin)/.test(txt))     return void message.reply('Günaydın babuş ☀️ yüzünü yıkamayı unutma!');
    if (/(iyi akşamlar|iyi aksamlar)/.test(txt)) return void message.reply('İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏');

    // Sadece @bot yazıldıysa (başka metin yoksa) "naber babuş 👻" — her seferinde
    const onlyMention = message.content.replace(/<@!?\d+>/g, '').trim().length === 0;
    if (onlyMention) return void message.reply('naber babuş 👻');

    // Mention + metin var ama özel cümle yoksa: sessiz
  }

  // ----------- KOMUTLAR (DEVAM) -----------
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
client.once('ready', () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
  // Durum: Oyun oynuyor — "Sagi tarafından oluşturuldu — yardım için sagimokhtari"
  client.user.setActivity('Sagi tarafından oluşturuldu — yardım için sagimokhtari', { type: 0 });
});
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));

// ====================== LOGIN =================================
client.login(process.env.TOKEN);
