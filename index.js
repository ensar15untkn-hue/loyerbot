// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const {
  Client, GatewayIntentBits, AuditLogEvent,
  ActivityType, PermissionFlagsBits
} = require('discord.js');

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

// Komut kanalı kısıtı (ban/mute/Yetkili Yardım burada çalışır)
const COMMAND_CHANNEL_ID = '1268595915476959312';

// Mute kullanabilen roller (owner her zaman kullanabilir)
const MUTE_ALLOWED_ROLES = new Set([
  '1268595623012208731',
  '1268595624211906684'
]);

// Yetkili yardım komutunu kullanabilen roller (owner her zaman kullanabilir)
const ADMIN_HELP_ALLOWED_ROLES = new Set([
  '1268595623012208731',
  '1268595624211906684',
  '1268595624899514412',
  '1268595626258595853'
]);

// !espiri metinleri (30 adet)
const ESPIRI_TEXTS = [
  'Bilim insanları diyor ki: Uykusuzluk hafızayı bozar. Ben de o yüzden dün gece… ne diyordum ben?',
  'Bir balinanın kalbi insan kadar ağır olabilir. Yani kalbi kırılan tek tür biz değiliz.',
  'Işık sesten hızlıdır; o yüzden bazı insanlar parlak görünür ama konuşunca her şey ortaya çıkar.',
  'Arılar dans ederek haberleşir. Ben de kahve içince benzer bir protokole geçiyorum: titreyerek anlaşıyorum.',
  'Mars’ta gün 24 saat 39 dakikadır. Yani geç kalmalarım bilimsel temellidir hocam.',
  'İnsan beyni günde yaklaşık 60 bin düşünce üretir. Benimkiler genelde “şifre neydi?” ile meşgul.',
  'Ahtapotların üç kalbi vardır. Benimki ise fatura gününde üç kez duruyor.',
  'Kediler günde 12–16 saat uyur. Verimlilik tanrıları şu an gözyaşı döküyor.',
  'Muzlar hafif radyoaktiftir; en tehlikelisi ısırıldığında biten potasyumdur.',
  'Satürn suya konsa yüzerdi. Keşke bütçem de bu kadar hafif olsa.',
  'Tavuklar insan yüzlerini ayırt edebilir. Market çıkışında indirimi kim yakalamış, biliyorlar.',
  'Şimşek, Güneş yüzeyinden daha sıcaktır. Ama elektrik faturasını görünce ben soğuyorum.',
  'Sümüklüböceklerin tuzla arası iyi değildir. Benim de ay sonuyla.',
  'Yunuslar isimleriyle çağrılabilir. Benim çağrıma sadece Wi-Fi cevap veriyor.',
  'Yıldızlar gördüğünde geçmişi görürsün. Spor salonunda da geçmiş formumu arıyorum.',
  'Japonya’daki makineler kola verir, kalbim ise umut… bazen bozuk para üstünü veremiyor.',
  'Karıncalar ağırlıklarının katlarını kaldırabilir. Ben de dertlerimin… bazen kaldıramıyorum.',
  'Kahve, performansı artırır; bende artırdığı şey konuşma hızım.',
  'İnsan vücudundaki kemiklerin yarısı eller ve ayaklardadır. Benim kodlarımın yarısı ise yorum satırı.',
  'Suyun %70’i Dünya’yı kaplar; kalan %30’u WhatsApp grupları.',
  'Bal arıları dans ederek yön tarif eder. Ben Google Maps ile bile kayboluyorum.',
  'Zürafaların ses telleri var ama nadir kullanırlar. Ben de alarmı kapatınca öyleyim.',
  'Kutup ayılarının derisi siyahtır; ben de faturaları görünce kararıyorum.',
  'Dünya her saniye 11 km hızla döner; iş günü ise yerinde sayıyor gibi.',
  'Bir bulut tonlarca ağırlık taşıyabilir; ben ise “son bir bölüm daha”yı.',
  'Soğan doğrarken göz yaşartır; dolar kurunu görünce de etkisi benzer.',
  'Timsahlar dili dışarı çıkaramaz; ben de diyete başlayamıyorum.',
  'Gözlerimiz burnumuzu görür ama beyin filtreler; ben de hataları prod’da fark ediyorum.',
  'Kelebekler ayaklarıyla tat alır; ben aklımla tatlıyı haklı çıkarıyorum.',
  'Ay’da rüzgâr yok; bayraklar yine de gönlümüzde dalgalanıyor.'
];

// Küçük yardımcılar
const tLower = (s) => s?.toLocaleLowerCase('tr') || '';
const hasAnyRole = (member, roleSet) => member?.roles?.cache?.some(r => roleSet.has(r.id));
const inCommandChannel = (message) => message.channel?.id === COMMAND_CHANNEL_ID;

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
  if (message.mentions?.users?.has?.(client.user.id)) return; // çift yanıt önleyici

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

  // ----------- ÜYE YARDIM (her yerde) -----------
  if (txt === '!yardım' || txt === '!yardim') {
    const helpText = `
📘 **Babuş'un Komut Rehberi (Üye)**

🎭 **!espiri** — Sana rastgele komik ve bilgilendirici bir espri söyler.
🪙 **!yazıtura** — Yazı mı Tura mı? Şansını dene babuş!
🎯 **!zar üst / !zar alt** — Zar atılır. 1-3 alt, 4-6 üst. Kazanırsın; kaybedersen ağlama, hakkını veririz. 😎
🎙️ **!ses** — Sunucuda en çok seste kalanların listesi.
🎧 **!sesme** — Senin toplam seste kalma süreni gösterir.
💬 **!sohbet** — Sohbet kanalında en çok yazanları gösterir.
👻 **@bot** — Etiketlersen seninle konuşur. “@bot naber babuş” falan yaz, keyfine bak.
☀️ **@bot günaydın** — Sabah enerjisiyle yüzünü yıkamayı hatırlatır.
🌙 **@bot iyi akşamlar** — Gece olunca üstünü örtmeni söyler (romantik dokunuşla).

🔒 Owner komutlarını boşver babuş, onlar teknik işler 😏
`;
    return void message.reply(helpText);
  }

  // ----------- EĞLENCE KOMUTLARI -----------
  // !espiri
  if (txt.trim() === '!espiri') {
    const joke = ESPIRI_TEXTS[Math.floor(Math.random() * ESPIRI_TEXTS.length)];
    return void message.reply(joke);
  }

  // 🪙 Yazı Tura
  if (txt === '!yazıtura' || txt === '!yazi-tura' || txt === '!yazı-tura') {
    const sonuc = Math.random() < 0.5 ? '🪙 **YAZI** geldi!' : '🪙 **TURA** geldi!';
    return void message.reply(`${sonuc} 🎲`);
  }

  // 🎯 Zar Oyunu — !zar üst|alt (1-3 alt, 4-6 üst)
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
    const text = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}**
${kazandi ? 'Kazandın 🎉' : 'Kaybettin 😿 ama ağlamayacaksın babuş, hakkını veririz.'}`;
    return void message.reply(text);
  }

  // ----------- YETKİLİ YARDIM (sadece komut kanalında ve yetkili rollere/owner'a) -----------
  if (txt === '!yardımyetkili' || txt === '!yardimyetkili' || txt === '!help-owner') {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    const isOwner = OWNERS.includes(uid);
    const hasRole = hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES);
    if (!isOwner && !hasRole) {
      return message.reply('⛔ Bu yardımı görme yetkin yok.');
    }

    const adminHelp = `
🛠️ **Yönetici Yardım — Moderasyon Komutları**

**!ban <kullanıcıId>**
• Kullanım: \`!ban 123456789012345678\`
• Yetki: Sadece **Sagi & Lunar (owner)**
• Not: Botta “Üyeleri Yasakla” yetkisi olmalı. Owner'lar banlanamaz.

**!mute <kullanıcıId> <dakika>**
• Kullanım: \`!mute 123456789012345678 15\`
• Yetki: **Owner** veya rolleri olanlar:
  - \`1268595623012208731\`, \`1268595624211906684\`, \`1268595624899514412\`, \`1268595626258595853\`
• Not: 1 dk – 43200 dk (30 gün). Botta “Üyeleri Zaman Aşımına Uğrat” yetkisi olmalı.

**!sohbet-sifirla**
• Sohbet liderliği sayaçlarını sıfırlar (tüm üyeler için).
• Yetki: **Owner**

**!ses-sifirla**
• Ses istatistiklerini sıfırlar (tüm üyeler için).
• Yetki: **Owner**

> ⚠️ Bu komutların hepsi sadece **<#${COMMAND_CHANNEL_ID}>** kanalında çalışır.
`;
    return void message.reply(adminHelp);
  }

  // ----------- REPLY TABANLI OTOMATİK CEVAPLAR -----------
  await handleReplyReactions(message);

  // ----------- BOT MENTION -----------
  if (message.mentions.users.has(client.user.id)) {
    // Özel cümleler mention ile gelirse sadece bunlara cevap ver
    if (txt.includes('teşekkürler sen'))     return void message.reply('iyiyim teşekkürler babuş👻');
    if (txt.includes('teşekkürler'))         return void message.reply('rica ederim babuş👻');
    if (txt.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
    if (txt.includes('naber babuş'))         return void message.reply('iyiyim sen babuş👻');
    if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return void message.reply('süper hep iyi ol ⭐');
    if (/(günaydın|gunaydin)/.test(txt))     return void message.reply('Günaydın babuş ☀️ yüzünü yıkamayı unutma!');
    if (/(iyi akşamlar|iyi aksamlar)/.test(txt)) return void message.reply('İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏');

    // Sadece @bot yazıldıysa (başka metin yoksa)
    const onlyMention = message.content.replace(/<@!?\d+>/g, '').trim().length === 0;
    if (onlyMention) return void message.reply('naber babuş 👻');
  }

  // ----------- İSTATİSTİK KOMUTLARI -----------
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

  // ----------- OWNER KOMUTLARI -----------
  // Ses Sıfırla
  if (txt === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) {
      for (const k of [...totals.keys()])    if (k.startsWith(`${gid}:`)) totals.delete(k);
      for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`🎙️ ${label} — Ses verileri sıfırlandı!`);
  }

  // Sohbet Sıfırla
  if (txt === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`💬 ${label} — Sohbet liderliği sıfırlandı!`);
  }

  // Ban (sadece komut kanalında + owner)
  if (txt.startsWith('!ban')) {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    if (!OWNERS.includes(uid)) {
      return message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
    }
    const m = message.content.match(/^!ban\s+(\d{17,20})$/);
    if (!m) return message.reply('Kullanım: `!ban <kullanıcıId>`');

    const targetId = m[1];
    if (!message.guild) return;
    try {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('⛔ Gerekli yetki yok: **Üyeleri Yasakla**');
      }
      if (OWNERS.includes(targetId)) return message.reply('⛔ Owner’ları banlayamam.');
      if (targetId === me.id) return message.reply('⛔ Kendimi banlayamam.');

      const member = await message.guild.members.fetch(targetId).catch(() => null);
      if (member && !member.bannable) {
        return message.reply('⛔ Bu üyeyi banlayamıyorum (rol hiyerarşisi/izin).');
      }

      await message.guild.members.ban(targetId, { reason: `Owner ban: ${message.author.tag}` });
      return void message.reply(`✅ <@${targetId}> banlandı.`);
    } catch (e) {
      console.error('!ban hata:', e);
      return message.reply('⛔ Ban işlemi başarısız oldu.');
    }
  }

  // Mute (sadece komut kanalında + owner veya yetkili roller)
  if (txt.startsWith('!mute')) {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    const invokerIsOwner = OWNERS.includes(uid);
    const invokerHasRole = hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES) || hasAnyRole(message.member, MUTE_ALLOWED_ROLES);
    if (!invokerIsOwner && !invokerHasRole) {
      return message.reply('⛔ Bu komutu kullanamazsın (gerekli rol yok).');
    }

    const m = message.content.match(/^!mute\s+(\d{17,20})\s+(\d{1,5})$/);
    if (!m) return message.reply('Kullanım: `!mute <kullanıcıId> <dakika>` (ör. `!mute 123456789012345678 15`)');

    const targetId = m[1];
    const minutes = Math.max(1, Math.min(43200, parseInt(m[2], 10))); // 1 dk - 30 gün
    const ms = minutes * 60 * 1000;

    if (!message.guild) return;
    try {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('⛔ Gerekli yetki yok: **Üyeleri Zaman Aşımına Uğrat**');
      }
      if (OWNERS.includes(targetId)) return message.reply('⛔ Owner’ları muteleyemem.');
      if (targetId === me.id) return message.reply('⛔ Kendimi muteleyemem.');

      const member = await message.guild.members.fetch(targetId).catch(() => null);
      if (!member) return message.reply('⛔ Kullanıcı bulunamadı.');
      if (!member.moderatable) return message.reply('⛔ Bu üyeyi muteleyemiyorum (rol hiyerarşisi/izin).');

      await member.timeout(ms, `Mute by ${message.author.tag} (${minutes} dk)`);
      return void message.reply(`✅ <@${targetId}> **${minutes} dk** susturuldu.`);
    } catch (e) {
      console.error('!mute hata:', e);
      return message.reply('⛔ Mute işlemi başarısız oldu.');
    }
  }

  // Owner → (!sohbet-sil <adet>) toplu mesaj silme (1–100, bulunduğu kanalda)
  if (txt.startsWith('!sohbet-sil')) {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    const m = txt.match(/^!sohbet-sil\s+(\d{1,3})$/);
    if (!m) return message.reply('Kullanım: `!sohbet-sil <adet>` (1–100)');
    const adet = Math.max(1, Math.min(100, parseInt(m[1], 10)));

    const me = message.guild?.members?.me;
    if (!me || !me.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('⛔ Gerekli yetki yok: **Mesajları Yönet**');
    }
    try {
      const deleted = await message.channel.bulkDelete(adet, true); // 14 günden eski atlanır
      const info = await message.channel.send(`🧹 ${deleted.size} mesaj silindi.`);
      setTimeout(() => info.delete().catch(() => {}), 5000);
    } catch (e) {
      console.error('!sohbet-sil hatası:', e);
      return message.reply('⛔ Silme başarısız (14 günden eski olabilir veya kanal tipi desteklemiyor).');
    }
  }
});

// ====================== KANAL KORUMA ===========================
client.on('channelDelete', async (channel) => {
  try {
    if (channel?.id !== SOHBET_KANAL_ID) return;
    const guild = channel.guild;
    if (!guild) return;

    await new Promise(r => setTimeout(r, 1500)); // audit gecikmesi

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
  // Durum: Oynuyor — "Sagi tarafından oluşturuldu — yardım için sagimokhtari"
  client.user.setPresence({
    activities: [{
      name: 'Sagi tarafından oluşturuldu — yardım için sagimokhtari',
      type: ActivityType.Playing
    }],
    status: 'online'
  });
});
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));

// ====================== LOGIN =================================
client.login(process.env.TOKEN);
