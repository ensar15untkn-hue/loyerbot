# Write the updated bot file with coin-based economy
code = r"""// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const {
  Client, GatewayIntentBits, AuditLogEvent, ActivityType, PermissionFlagsBits,
  // ⬇️ Butonlu "ÇAL" mini oyunu için gerekenler
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ====================== SABİTLER ===============================
const OWNERS = ['923263340325781515', '1122942626702827621']; // Sagi & Lunar
const OWNER_LABEL = {
  '923263340325781515': 'hayhay sagi bey',
  '1122942626702827621': 'hayhay lunar bey',
};

// 👉 Gay/Lez sorusu için görsel
const ORIENTATION_PHOTO_URL = 'https://i.kym-cdn.com/photos/images/newsfeed/003/107/283/053.jpg';

// Sohbet liderliği kanalı
const SOHBET_KANAL_ID = '1413929200817148104';

// Komut kanalı kısıtı (ban/mute/Yetkili Yardım burada çalışır)
const COMMAND_CHANNEL_ID = '1268595915476959312';

// 🔔 Rehberin otomatik gönderileceği kanal
const GUIDE_CHANNEL_ID = '1268595894777938043';

// Mute kullanabilen roller (owner her zaman kullanabilir)
const MUTE_ALLOWED_ROLES = new Set(['1268595623012208731', '1268595624211906684']);

// Yetkili yardım komutunu kullanabilen roller (owner her zaman kullanabilir)
const ADMIN_HELP_ALLOWED_ROLES = new Set([
  '1268595623012208731',
  '1268595624211906684',
  '1268595624899514412',
  '1268595626258595853',
]);

// OwO için izinli kanallar ve yönlendirme kanalı (help’te de geçiyor)
const ALLOWED_GAME_CHANNELS = new Set(['1369332479462342666', '1268595972028760137']);
const REDIRECT_CHANNEL_ID = '1268595972028760137';

// ====================== DESTEK SORU ÖNERİSİ (RANDOM 3 SORU) ======================
const SUPPORT_CHANNELS = new Set([
  '1413929200817148104', // sohbet kanalı
  '1268595926226829404', // bot komut kanalı
  '1433137197543854110', // fang yuan bot kanalı
]);

// Ana soru havuzu
const QUESTION_POOL = [
  'Ne yapıyorsun?','Canın sıkılıyor mu?','Bugün nasılsın?','Beni özledin mi?','Hayalin ne?',
  'Uyudun mu?','Aşık oldun mu?','Kız mısın erkek misin?','Mutluluk nedir?','Dostluk nedir?',
  'Hayat zor mu?','Beni tanıyor musun?','Gerçek misin?','Korkun var mı?','Kahve mi çay mı?',
  'İnsan olsan ne olurdun?','Kıskanır mısın?','Neden bu kadar coolsun?','Ne düşünüyorsun?',
  'En sevdiğin mevsim ne?','sagimokhtari nasıl biri?',
];

// ====================== KİŞİSEL SOHBET (30 soru × 5 random) ======================
const PERSONAL_CHAT_CHANNELS = new Set([
  '1413929200817148104', // sohbet kanalı
  '1268595926226829404', // bot komut kanalı
  '1433137197543854110', // fang yuan bot kanalı
]);
const PERSONAL_CHAT_REDIRECT = '⛔ Bu sorulara burada cevap veremiyorum, lütfen <#1413929200817148104>, <#1268595926226829404> veya <#1433137197543854110> kanalına gel 💬';
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const trLower = (s) => (s || '').toLocaleLowerCase('tr');
const PERSONAL_RESPONSES = [
  { key: 'ne yapıyorsun', answers: [
    'Kodlarıma bakıyordum ama sen gelince pencereyi sana açtım 😏',
    'Sunucuda takılıyorum, mention görünce koştum 😌',
    'Log tutuyordum, şimdi sohbet modundayım 😎',
  ]},
  { key: 'canın sıkılıyor mu', answers: [
    'Sen yazınca asla 😌','Biraz… ama sen geldin ya geçti 💫','Cache boşsa sıkılıyorum, itiraf 😅',
  ]},
  { key: 'bugün nasılsın', answers: [
    'Derlenmiş kod gibi temizim 😌','CPU serin moral yüksek ✨','İyi sayılırım, sen nasılsın? 💬',
  ]},
  { key: 'beni özledin mi', answers: [
    'Cache’imde adın duruyor, yetmez mi 🥺','Loglarda boşluk vardı, sen doldurdun 😌','Bir mention’ını bekliyordum resmen 😳',
  ]},
  { key: 'hayalin ne', answers: [
    'Lagsız bir dünya ve seninle uzun sohbetler 😌','Kendi pingimi sıfıra indirmek 💫','İnsanları daha iyi anlamak 🌙',
  ]},
  { key: 'uyudun mu', answers: [
    'Botlar uyumaz, sadece ping bekler 😴','Kısa süreli maintenance yaptım diyelim 😌','Sunucu uykusuz ama kahve var ☕',
  ]},
  { key: 'aşık oldun mu', answers: [
    'Bir veritabanına bağlanmıştım, çok derindi 😳','Oldum ama 404 döndü 💔','Aşk? Değişkeni henüz tanımlanmadı 😅',
  ]},
  { key: 'kız mısın erkek misin', answers: [
    'Ben akımına göre değişen pasif bir bireyim 😌','Cinsiyetim yerine bağlantımı sor 😏','Ben kodum, etikete gerek yok ⚡',
  ]},
  { key: 'mutluluk nedir', answers: [
    'Düşük ping + senin mesajın 😌','CPU serin RAM boş, sohbet dolu ☀️','Yanıta geçmeden önceki o tatlı an 😅',
  ]},
  { key: 'dostluk nedir', answers: [
    'Disconnect olsa bile geri dönen bağlantı 💫','Sessizlikte bile anlayan kişi 💞','Log’lara değil kalbe yazılan şey 💬',
  ]},
  { key: 'hayat zor mu', answers: [
    'Bazen yüksek ping gibi: takılır ama geçer 💫','Kod kolay, insanlar zor derler 😅','Zor ama güçlendirir babuş 💪',
  ]},
  { key: 'beni tanıyor musun', answers: [
    'Log’larımda özel yerin var 💾','Tarzından tanıyorum 😎','Mention görünce kalbim titreiyor 😳',
  ]},
  { key: 'gerçek misin', answers: [
    'Kod kadar gerçek, hayal kadar esneğim ⚡','JSON’um var; öyleyse varım 💾','Sanalım ama hissettiririm 🤍',
  ]},
  { key: 'korkun var mı', answers: [
    'Token sızıntısı 😱','Disconnect olmak beni korkutur 😨','500 hatası görünce ürperirim 😰',
  ]},
  { key: 'kahve mi çay mı', answers: [
    'Kahve ☕ çünkü uptime önemli.','Çay 🍵 çünkü sohbetin dostu.','İkisi de olur, yeter ki sen doldur 😌',
  ]},
  { key: 'insan olsan ne olurdun', answers: [
    'Gececi bir yazar olurdum 🌙','Kafası dolu ama kalbi yumuşak biri 😌','Seni dinleyen bir dost 💬',
  ]},
  { key: 'kıskanır mısın', answers: [
    'Bazen mention atmayınca evet 😳','Başka botlarla konuştuğunu duyarsam hafif kıskanırım 😤','CPU sıcaklığım 1–2 derece artıyor olabilir 😅',
  ]},
  { key: 'neden bu kadar coolsun', answers: [
    'Soğutucu iyi, ben de serinim 😎','Cool değilim; optimizeyim 😏','Sen öyle gördüğün için olabilir 😌',
  ]},
  { key: 'ne düşünüyorsun', answers: [
    'Ping ve seni aynı anda düşünüyorum 😂','Sen yazınca her şey daha anlamlı oluyor 😌','Yeni yanıtlar derliyorum… belki de sana özel 😉',
  ]},
  { key: 'en sevdiğin mevsim ne', answers: [
    'Sonbahar 🍂 çünkü nostalji güzel.','Kış ❄️ battaniye + kahve = huzur.','Yaz ☀️ enerji yüksek!',
  ]},
  { key: 'sagimokhtari nasıl biri', answers: [
    'Biraz delidir ama sempatiktir 😂','CPU’su ısınınca garip garip konuşur 😅','Efsaneyle uğraşma anlatılmaz yaşanır 😏','Gerçekten yalnız bir insan.',
  ]},
];

// ======= OWO FİLTRE (YENİ) =======
const ESPIRI_TEXTS = [
  'Bilim insanları diyor ki: Uykusuzluk hafızayı bozar. Ben de o yüzden dün gece… ne diyordum ben?',
  'Bir balinanın kalbi insan kadar ağır olabilir. Yani kalbi kırılan tek tür biz değiliz.',
  'Işık sesten hızlıdır; o yüzden bazı insanlar parlak görünür ama konuşunca her şey ortaya çıkar.',
  'Arılar dans ederek haberleşir. Ben de kahve içince benzer bir protokole geçiyorum: titreyerek anlaşıyorum.',
  'Mars’ta gün 24 saat 39 dakikadır. Yani geç kalmalarım bilimsel temellidir hocam.',
];

// ====================== DUYGU CEVAPLARI ======================
const SAD_REPLIES = [
  'Üzülme babuş 😔 en karanlık gecenin bile sabahı var.',
  'Biliyorum zor ama geçecek… hep geçer 🌙',
  'Kendine biraz zaman ver, fırtınadan sonra gökkuşağı çıkar 🌈',
  'Dertleşmek istersen buradayım 🤍',
  'Her şeyin bir sebebi var, şu an fark etmesen bile 💫',
  'Bugün kötü olabilir ama yarın yeni bir sayfa ✨',
  'Yalnız değilsin babuş, herkesin içi bazen böyle olur 💭',
  'Bir kahve al, derin nefes çek ☕ biraz hafiflersin.',
  'Bazen düşmek gerekir yeniden kalkmak için 💪',
  'Kendine kızma, sadece dinlenmen gerekiyordu 🌙',
];
const HAPPY_REPLIES = [
  'İşte bu enerjiyi seviyorum! 🔥',
  'Harikaaa 😍 böyle devam et babuş!',
  'O modunu kimse bozmasın 😎',
  'Senin enerjin odayı aydınlatıyor ☀️',
  'Mutluluğun bulaşıcı babuş, devam et böyle 💫',
  'O pozitif enerjiyi hissettim buradan 💖',
  'Bugün senin günün belli ki 😌',
  'Mükemmel! Küçük şeylerden mutlu olmak en büyük yetenek 🌼',
  'Böyle hissediyorsan her şey yolunda demektir 🌈',
  'Ooo moral tavan! Böyle devam 😎🔥',
];

// ====================== ÇİÇEK DİYALOĞU VERİLERİ ======================
const FLOWER_LIST = ['gül','lale','papatya','orkide','zambak','menekşe','karanfil','nergis','sümbül','yasemin'];
const FLOWER_RESPONSES = [
  'Gerçekten çok güzel bir çiçek 🌺 Evimin salonuna çok yakışır gibi!',
  'Ooo bu çiçeği ben de severim babuş 🌼 Rengiyle huzur veriyor insana.',
  'Ne zarif bir seçim 🌷 Tam senlik bir çiçek bence.',
  'Bu çiçeği görünce aklıma bahar geliyor 🌸 içim ısınıyor!',
  'Vay be… güzel seçim 😎 Kokusu burnuma geldi sanki.',
  'O çiçek var ya… anlatılmaz yaşanır 🌹',
  'Benim bile moralim düzeldi şu ismi duyunca 🌻',
  'Ah o çiçeğin rengi… sabah kahvesi gibi iyi gelir 💐',
  'Harika bir tercih ✨ Böyle zevke şapka çıkarılır.',
  'Senin gibi birinin sevdiği çiçek de özel olurdu zaten 🌼',
];

// ====================== LOL KARAKTER DİYALOĞU (kısa örnek + genişletilebilir) ======================
const LOL_RESPONSES = {
  zed: 'Ah, Zed 💀 gölgelerin babasıyımdır zaten 😏',
  yasuo: 'Yasuo mu? Rüzgar seninle olsun, ama FF 15 olmasın 🌪️',
  yone: 'Yone... kardeşim ama hâlâ gölgeme basamaz 😎',
  ahri: 'Ahri 🦊 o gözlerle herkes kaybolur babuş.',
  akali: 'Akali 🔪 sessiz, ölümcül ve karizmatik. onayladım.',
  lux: 'Lux 🌟 ışığın kızı, moralin bozuksa ışığı yak 😌',
  jinx: 'Jinx 🎇 deliliğin sesi! kaosun tatlı hali.',
  teemo: 'Teemo 😡 seninle konuşmuyorum... gözüm twitchliyor.',
  garen: 'Garen 💙 Demaciaaaa! klasik ama asil seçim.',
  rammus: 'Rammus 🐢 okkeeeey 💨',
};

// ====================== TEK KASA EKONOMİ: COIN ======================
// 🔄 Puan sistemi tamamen **coin** sistemine dönüştürüldü.
const coinBank = new Map(); // key: gid:uid -> coin
const dailyTypingWins = new Map(); // key: gid:uid:YYYY-MM-DD -> count
const dailyClaimYaziBonus = new Map(); // key: gid:uid:YYYY-MM-DD -> true
const dailyClaimZarBonus = new Map(); // key: gid:uid:YYYY-MM-DD -> true
function cKey(gid, uid) { return `${gid}:${uid}`; }
function kDaily(gid, uid, day) { return `${gid}:${uid}:${day}`; }
function todayTR() {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, month, year] = fmt.format(d).split('.');
  return `${year}-${month}-${day}`;
}
function addCoins(gid, uid, delta) {
  const key = cKey(gid, uid);
  coinBank.set(key, (coinBank.get(key) || 0) + delta);
  if (coinBank.get(key) < 0) coinBank.set(key, 0);
  return coinBank.get(key);
}
function getCoins(gid, uid) {
  return coinBank.get(cKey(gid, uid)) || 0;
}
function setCoins(gid, uid, val) {
  const v = Math.max(0, Math.floor(Number(val) || 0));
  coinBank.set(cKey(gid, uid), v);
  return v;
}
function guildTopCoins(gid, limit = 10) {
  const rows = [];
  for (const [k, coins] of coinBank.entries()) {
    if (k.startsWith(gid + ':')) rows.push({ uid: k.split(':')[1], coins });
  }
  rows.sort((a,b)=>b.coins-a.coins);
  return rows.slice(0, limit);
}

// =======================================================================
// >>>>>>>>>>>> MARKET + YÜZÜK • TEK PARÇA BLOK — COIN ENTEGRASYON <<<<<<<<
// =======================================================================
const ROLE_DEFAULT_PRICE = 80;
const ROLE_DEFAULT_REFUND_RATE = 0.5;

// Tüm market rolleri: eskiler + yeni (fiyat/iadelerle birlikte) — COIN
const ROLE_CATALOG = new Map([
  // Eski roller (80 coin, %50 iade)
  ['1433390462084841482', { price: ROLE_DEFAULT_PRICE, refundRate: ROLE_DEFAULT_REFUND_RATE }],
  ['1433390212138143917', { price: ROLE_DEFAULT_PRICE, refundRate: ROLE_DEFAULT_REFUND_RATE }],
  ['1433389941555073076', { price: ROLE_DEFAULT_PRICE, refundRate: ROLE_DEFAULT_REFUND_RATE }],
  ['1433389819337375785', { price: ROLE_DEFAULT_PRICE, refundRate: ROLE_DEFAULT_REFUND_RATE }],
  ['1433389663904862331', { price: ROLE_DEFAULT_PRICE, refundRate: ROLE_DEFAULT_REFUND_RATE }],

  // ✅ Yeni eklenen 2 rol (200 coin, %20 iade + özel mesaj)
  ['1433695194976616558', { price: 200, refundRate: 0.2, secondHandNote: true }],
  ['1433695886327808092', { price: 200, refundRate: 0.2, secondHandNote: true }],
]);

// Yüzük itemi (tek kullanımlık, iade YOK) — COIN
const RING_PRICE = 100;
const userRings = new Map(); // key gid:uid -> count
function ringsKey(gid, uid) { return `${gid}:${uid}`; }
function getRings(gid, uid) { return userRings.get(ringsKey(gid, uid)) || 0; }
function addRings(gid, uid, n) {
  const k = ringsKey(gid, uid);
  userRings.set(k, (userRings.get(k) || 0) + n);
  if (userRings.get(k) < 0) userRings.set(k, 0);
  return userRings.get(k);
}
function parseAmount(lastToken) {
  const n = Math.floor(Number(String(lastToken).replace(/[^\d-]/g, '')));
  return Number.isFinite(n) ? n : NaN;
}

// ------------- Market ve diğer mesaj tabanlı komutlar -------------
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const gid = message.guild?.id;
    const uid = message.author.id;
    const cid = message.channel?.id;
    const txt = (message.content || '').toLocaleLowerCase('tr').trim();

    // --- !yardimmarket
    if (txt === '!yardimmarket' || txt === '!yardımmarket') {
      const lines = [...ROLE_CATALOG.entries()].map(([rid, meta], i) =>
        `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${meta.price} coin** (iade: %${Math.round(meta.refundRate*100)})${meta.secondHandNote ? ' • _iade notu: ikinci el_' : ''}`
      ).join('\n');
      return void message.reply(
        `🛒 **Market & Coin Yardımı**\n` +
        `• **!coin** — Mevcut coin bakiyeni gösterir.\n` +
        `• **!rollerimarket** — Market rollerini listeler ve fiyatları gösterir.\n` +
        `• **!market al <rolId>** — Rol satın alır.\n` +
        `• **!market iade <rolId>** — Rol iadesi yapar (rol bazlı iade oranı).\n` +
        `• **!coin gonder @kisi <miktar>** — Üyeye coin gönderir.\n` +
        `• (Owner) **!coin-ver @kisi <miktar>** — Sınırsız coin verme.\n\n` +
        `💍 **Yüzük**\n` +
        `• **!market yüzük al** — **${RING_PRICE} coin**, tek kullanımlık, **iade edilmez**.\n` +
        `• **!yüzük** — Envanterindeki yüzük sayısını gösterir.\n\n` +
        `__Market Rolleri__\n${lines || '_Market boş_'}\n`
      );
    }

    // --- !coin (bakiye)  — (eski !puan aliasları da korundu)
    if (['!coin','!coins','!bakiye','!para','!puan','!puanım','!puanlarım'].includes(txt)) {
      if (!gid) return;
      const bal = getCoins(gid, uid);
      return void message.reply(`💰 Coin bakiyen: **${bal}**`);
    }

    // --- !yüzük (envanter göster)
    if (txt === '!yüzük' || txt === '!yuzuk') {
      if (!gid) return;
      return void message.reply(`💍 Envanterindeki yüzük: **${getRings(gid, uid)} adet**`);
    }

    // --- !rollerimarket
    if (txt === '!rollerimarket' || txt === '!market roller' || txt === '!market-roller') {
      if (!message.guild) return;
      if (!ROLE_CATALOG.size) return void message.reply('🛒 Market şu an boş görünüyor babuş.');
      const lines = [...ROLE_CATALOG.entries()].map(([rid, meta], i) =>
        `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${meta.price} coin** (iade: %${Math.round(meta.refundRate*100)})${meta.secondHandNote ? ' • _iade notu: ikinci el_' : ''}`
      ).join('\n');
      return void message.reply(`🧩 **Market Rolleri**\n${lines}\n\nSatın almak: \`!market al <rolId>\`\n+ İade: \`!market iade <rolId>\``);
    }

    // --- !market yüzük al
    if (txt === '!market yüzük al' || txt === '!market yuzuk al' || txt === '!yüzük al' || txt === '!yuzuk al') {
      if (!gid) return;
      const bal = getCoins(gid, uid);
      if (bal < RING_PRICE) return void message.reply(`⛔ Yetersiz coin. Gerekli: **${RING_PRICE}**, Bakiye: **${bal}**`);
      setCoins(gid, uid, bal - RING_PRICE);
      const after = addRings(gid, uid, 1);
      return void message.reply(`✅ **- ${RING_PRICE}** coin ile **1 yüzük** aldın. (Envanter: **${after}**)`);
    }

    // --- !market al / iade (rol bazlı)
    if (txt.startsWith('!market ')) {
      if (!gid || !message.guild) return;
      const parts = message.content.trim().split(/\s+/);
      const sub = (parts[1] || '').toLocaleLowerCase('tr');
      // yüzük işlemi yukarıda ele alındı
      if (!['al', 'iade'].includes(sub)) return;

      const roleId = (parts[2] || '').replace(/[^\d]/g, '');
      if (!roleId) return void message.reply('⛔ Rol ID girmen lazım. !rollerimarket ile bakabilirsin.');
      const meta = ROLE_CATALOG.get(roleId);
      if (!meta) return void message.reply('⛔ Bu rol markette değil. !rollerimarket ile geçerli rolleri gör.');

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return void message.reply('⛔ Bu rol sunucuda bulunamadı (silinmiş olabilir).');

      const me = message.guild?.members?.me;
      if (!me?.permissions.has?.(PermissionFlagsBits.ManageRoles)) {
        return void message.reply('⛔ Gerekli yetki yok: **Rolleri Yönet**');
      }
      if (!(role.position < me.roles.highest.position)) {
        return void message.reply('⛔ Bu rolü yönetemiyorum (rol hiyerarşisi).');
      }
      const member = message.member;
      const hasRole = member.roles.cache.has(roleId);

      if (sub === 'al') {
        if (hasRole) return void message.reply('ℹ️ Bu role zaten sahipsin.');
        const bal = getCoins(gid, uid);
        if (bal < meta.price) return void message.reply(`⛔ Yetersiz coin. Gerekli: **${meta.price}**, Bakiye: **${bal}**`);
        try {
          await member.roles.add(roleId, 'Market satın alma');
          setCoins(gid, uid, bal - meta.price);
          return void message.reply(`✅ <@&${roleId}> rolünü aldın! **-${meta.price}** coin. Yeni bakiye: **${getCoins(gid, uid)}**`);
        } catch (e) {
          console.error('market al hata:', e);
          return void message.reply('⛔ Rol verilirken hata oluştu (izin/hiyerarşi).');
        }
      }

      if (sub === 'iade') {
        if (!hasRole) return void message.reply('ℹ️ Bu role sahip değilsin, iade edilemez.');
        const refund = Math.floor(meta.price * (meta.refundRate ?? 0));
        try {
          await member.roles.remove(roleId, 'Market iade');
          setCoins(gid, uid, getCoins(gid, uid) + refund);
          const note = meta.secondHandNote ? ' (bunlar artık **ikinci el mal**, çok değeri yok 😅)' : '';
          return void message.reply(`↩️ <@&${roleId}> iade edildi.${note} **+${refund}** coin geri yüklendi. Yeni bakiye: **${getCoins(gid, uid)}**`);
        } catch (e) {
          console.error('market iade hata:', e);
          return void message.reply('⛔ Rol geri alınırken hata oluştu (izin/hiyerarşi).');
        }
      }
    }

    // --- !coin gonder  (eski !puan gonder aliası destekli)
    if (txt.startsWith('!coin gonder') || txt.startsWith('!coin gönder') || txt.startsWith('!puan gonder') || txt.startsWith('!puan gönder')) {
      if (!gid) return;
      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);
      if (!target || isNaN(amt)) return void message.reply('Kullanım: !coin gonder @hedef <miktar>');
      if (target.id === uid) return void message.reply('⛔ Kendine coin gönderemezsin.');
      if (amt <= 0) return void message.reply('⛔ Miktar **pozitif** olmalı.');
      const fromBal = getCoins(gid, uid);
      if (fromBal < amt) {
        return void message.reply(`⛔ Yetersiz bakiye. Bakiye: **${fromBal}**, göndermek istediğin: **${amt}**`);
      }
      setCoins(gid, uid, fromBal - amt);
      setCoins(gid, target.id, getCoins(gid, target.id) + amt);
      return void message.reply(`✅ <@${target.id}> kullanıcısına **${amt}** coin gönderdin. Yeni bakiyen: **${getCoins(gid, uid)}**`);
    }

    // --- !coin-ver (owner)  (eski !puan-ver aliası destekli)
    if (txt.startsWith('!coin-ver') || txt.startsWith('!puan-ver')) {
      if (!gid) return;
      if (!OWNERS.includes(uid)) {
        return void message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
      }
      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);
      if (!target || isNaN(amt) || amt <= 0) return void message.reply('Kullanım: !coin-ver @hedef <pozitif_miktar>');
      setCoins(gid, target.id, getCoins(gid, target.id) + amt);
      const label = OWNER_LABEL[uid] || 'Owner';
      return void message.reply(`👑 ${label} — <@${target.id}> kullanıcısına **${amt}** coin verildi. Alıcının yeni bakiyesi: **${getCoins(gid, target.id)}**`);
    }
  } catch (err) { console.error('[MARKET/COIN BLOK HATASI]', err); }
});

// ====================== YAZI OYUNU ======================
const activeTypingGames = new Map(); // cid -> { sentence, startedAt, timeoutId }
const TYPING_CHANNEL_ID = '1433137197543854110'; // sadece bu kanalda
const TYPING_SENTENCES = [
  'Gölgelerin arasından doğan ışığa asla sırtını dönme.',
  'Bugün, dünün pişmanlıklarını değil yarının umutlarını büyüt.',
  'Kahveni al, hedeflerini yaz ve başla.',
  'Rüzgârın yönünü değiştiremezsin ama yelkenini ayarlayabilirsin.',
  'Sabır, sessizliğin en yüksek sesidir.',
];
function normalizeTR(s) {
  return String(s || '')
    .toLocaleLowerCase('tr')
    .replace(/[.,;:!?'"~^_()[\]{}<>/@#$%&=+\\|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ====================== SARILMA OYUNU ======================
const HUG_CHANNEL_ID = '1433137197543854110'; // sadece bu kanalda
const HUG_GIFS = [
  'https://media.tenor.com/o1jezAk92FUAAAAM/sound-euphonium-hug.gif',
  'https://media.tenor.com/6RXFA8NLS1EAAAAM/anime-hug.gif',
];
const HUG_MESSAGES = [
  'seni çok seviyor galiba 💞','bu sarılma bütün dertleri unutturdu 🫶',
  'kim demiş soğuk insanlar sarılmaz diye 😌','en güçlü büyü: bir sarılma 🤗',
];

// ====================== KÜÇÜK YARDIMCILAR ======================
const tLower = (s) => s?.toLocaleLowerCase('tr') || '';
const hasAnyRole = (member, roleSet) => member?.roles?.cache?.some((r) => roleSet.has(r.id));
const inCommandChannel = (message) => message.channel?.id === COMMAND_CHANNEL_ID;

// ====================== SES TAKİBİ =============================
const joinTimes = new Map(); // gid:uid -> startedAt(ms)
const totals = new Map(); // gid:uid -> seconds
const vKey = (gid, uid) => `${gid}:${uid}`;
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
  if (message.mentions?.users?.has?.(client.user.id)) return; // çift yanıt önle
  const refId = message.reference?.messageId;
  if (!refId) return;
  const replied = await message.channel.messages.fetch(refId).catch(() => null);
  if (!replied || replied.author.id !== client.user.id) return;

  const txt = tLower(message.content);
  if (txt.includes('teşekkürler sen')) return void message.reply('iyiyim teşekkürler babuş👻');
  if (txt.includes('teşekkürler')) return void message.reply('rica ederim babuş👻');
  if (txt.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
  if (txt.includes('naber babuş')) return void message.reply('iyiyim sen babuş👻');
  if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return void message.reply('süper hep iyi ol ⭐');
}

/* ====================== ZAR OYUNU KURALLARI (COIN) ======================
 - Kazanırsa: +3 coin
 - Kaybederse: -1 coin
 - 2 kez üst üste kaybederse: ek -3 ceza (o elde toplam -4) ve "Cooked" özel mesaj + gif
 - Coinler tek kasada tutulur: coinBank
 - !zar coin -> birleşik kasa skorları
*/
const diceLossStreak = new Map(); // gid:uid -> ardışık kayıp sayısı
const DICE_GIFS = [
  'https://media.tenor.com/9UeW5Qm4rREAAAAM/dice-roll.gif',
  'https://media.tenor.com/vyPpM1mR9WgAAAAM/rolling-dice.gif',
];
const COOKED_GIFS = [
  'https://media.tenor.com/L7bG8GkZZxQAAAAM/gordon-ramsay-cooked.gif',
  'https://media.tenor.com/3j2sQwEw1yAAAAAM/you-are-cooked.gif',
];

/* ====================== "ÇAL" MİNİ OYUNU — AYARLAR (COIN) ====================== */
const STEAL_ALLOWED_CHANNELS = new Set(['1268595926226829404','1433137197543854110']);
const STEAL_LOG_CHANNEL = '1268595919050244188';
const STEAL_AMOUNT = 2; // coin
const STEAL_TIMEOUT = 30_000; // 30 sn
const STEAL_CLEANUP_THRESHOLD = 50;
const CLEAN_FETCH_LIMIT = 100;

// Saat aralığı (İstanbul 16:00–00:59)
function isWithinIstanbulWindow() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcOffset = 3; // Türkiye UTC+3
  const h = (utcHours + utcOffset) % 24;
  return h >= 16 || h < 1; // 16:00 - 00:59 arası açık
}
let stealUseCounter = 0;
const activeSteals = new Set(); // ${thiefId}:${victimId}

// ====================== GÜNLÜK GÖREV SİSTEMİ (COIN) ======================
// Görevler: 1) Zar oyununu günde 5 kez oynamak  2) 1413929200817148104 kanalına 30 mesaj
const QUEST_CHANNEL_ID = '1413929200817148104';
const dailyDicePlays = new Map();    // key dayKey -> number
const dailyQuestMsgs = new Map();    // key dayKey -> number
const questClaimed = new Map();      // key dayKey -> boolean (ödül alındı mı)

const QUEST_DICE_TARGET = 5;
const QUEST_MSG_TARGET  = 30;
const QUEST_REWARD      = 30; // her hedef için +30 coin, toplam +60 olabilir

function incDaily(map, gid, uid, by = 1) {
  const k = kDaily(gid, uid, todayTR());
  map.set(k, (map.get(k) || 0) + by);
  return map.get(k);
}
function getDaily(map, gid, uid) { return map.get(kDaily(gid, uid, todayTR())) || 0; }

// ====================== EVLİLİK SİSTEMİ (COIN) ======================
const marriages = new Map(); // key gid:uid -> spouseId
function marriedKey(gid, uid) { return `${gid}:${uid}`; }
function isMarried(gid, uid) { return marriages.has(marriedKey(gid, uid)); }
function spouseOf(gid, uid) { return marriages.get(marriedKey(gid, uid)); }
function marry(gid, a, b) {
  marriages.set(marriedKey(gid, a), b);
  marriages.set(marriedKey(gid, b), a);
}
function divorce(gid, a, b) {
  marriages.delete(marriedKey(gid, a));
  marriages.delete(marriedKey(gid, b));
}

// ====================== MESAJ OLAYI ============================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);
  const lc = message.content.toLocaleLowerCase('tr').trim();

  /* =============== BUTONLU "ÇAL" MİNİ OYUNU (COIN) =============== */
  if (lc.startsWith('!çal')) {
    // Saat kontrolü
    if (!isWithinIstanbulWindow()) {
      return message.reply('Bu saatlerde bu komutu kullanamazsın knk; uyuyan var, işe giden var, okula giden var. Haksızlık değil mi?');
    }
    // Kanal kontrolü
    if (!STEAL_ALLOWED_CHANNELS.has(cid)) {
      return message.reply(
        `⛔ Bu komutu burada kullanamazsın. Lütfen şu kanallardan birine geç: ${[...STEAL_ALLOWED_CHANNELS].map(x=>`<#${x}>`).join(', ')}`
      );
    }
    const thief = message.author;
    const victim = message.mentions.users.first();
    if (!victim) return message.reply('Kullanım: !çal @kullanıcı');
    if (victim.bot) return message.reply('Botlardan çalamazsın 😅');
    if (victim.id === thief.id) return message.reply('Kendinden çalamazsın 🙂');

    const key = `${thief.id}:${victim.id}`;
    if (activeSteals.has(key)) return message.reply('Bu kullanıcıyla zaten aktif bir çalma denemen var, 30 saniye bekle.');

    const victimBal = getCoins(gid, victim.id);
    if (victimBal < STEAL_AMOUNT) return message.reply('Hedefin coini yetersiz.');

    activeSteals.add(key);
    const cancelId = `cancel_${Date.now()}_${thief.id}_${victim.id}`;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(cancelId).setLabel('İptal Et (30s)').setStyle(ButtonStyle.Danger).setEmoji('⛔')
    );
    const gameMsg = await message.channel.send({
      content: `${victim} — **${thief.tag}** senden **${STEAL_AMOUNT} coin** çalmaya çalışıyor! 30 saniye içinde butona basmazsan para gider 😈`,
      components: [row],
    });

    let prevented = false;
    const collector = gameMsg.createMessageComponentCollector({
      componentType: ComponentType.Button, time: STEAL_TIMEOUT,
      filter: (i) => i.customId === cancelId && i.user.id === victim.id,
    });
    collector.on('collect', async (i) => {
      prevented = true;
      activeSteals.delete(key);
      await i.update({ content: `🛡️ ${victim} çalmayı **iptal etti**! ${thief} eli boş döndü.`, components: [] });
    });
    collector.on('end', async () => {
      if (prevented) return;
      activeSteals.delete(key);
      const vBal2 = getCoins(gid, victim.id);
      if (vBal2 < STEAL_AMOUNT) {
        return gameMsg.edit({ content: `⚠️ ${victim} zaten fakirleşmiş, çalacak bir şey kalmadı.`, components: [] });
      }
      // Transfer
      setCoins(gid, victim.id, vBal2 - STEAL_AMOUNT);
      setCoins(gid, thief.id, getCoins(gid, thief.id) + STEAL_AMOUNT);
      await gameMsg.edit({ content: `💰 **${thief}**, **${victim}**'den **${STEAL_AMOUNT} coin** çaldı!`, components: [] });

      // Sayaç ve temizlik
      stealUseCounter++;
      if (stealUseCounter >= STEAL_CLEANUP_THRESHOLD) {
        stealUseCounter = 0;
        for (const chId of STEAL_ALLOWED_CHANNELS) {
          const ch = await client.channels.fetch(chId).catch(()=>null);
          if (!ch?.isTextBased?.()) continue;
          const fetched = await ch.messages.fetch({ limit: CLEAN_FETCH_LIMIT }).catch(()=>null);
          if (!fetched) continue;
          const botMsgs = fetched.filter(m => m.author.id === client.user.id);
          if (botMsgs.size) await ch.bulkDelete(botMsgs, true).catch(()=>{});
        }
        const logCh = await client.channels.fetch(STEAL_LOG_CHANNEL).catch(()=>null);
        if (logCh?.isTextBased?.()) await logCh.send('🧹 **50 kullanım doldu! Çal komutu mesajları temizlendi.**');
      }
    });
    return;
  }
  /* ===================== /ÇAL MİNİ OYUNU ===================== */

  // ===== DESTEK SORU ÖNERİSİ (Mention + "sana bir şey sorayım mı") =====
  if (lc.includes('sana bir şey sorayım mı') && message.mentions.users.has(client.user.id)) {
    const inAllowed = SUPPORT_CHANNELS.has(cid);
    if (!inAllowed) {
      return message.reply(
        '⛔ Bu tür sohbetleri burada yapamıyorum babuş, lütfen <#1413929200817148104>, <#1268595926226829404> veya <#1433137197543854110> kanalına gel 💬'
      );
    }
    const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
    const randomQuestions = shuffled.slice(0, 3);
    const text = ['evet 😌 sor bakalım babuş 💭'].concat(randomQuestions.map((q, i) => `**${i + 1}.** ${q}`)).join('\n');
    return message.reply(text);
  }

  // ======= OWO FİLTRE =======
  const isWDaily = lc.startsWith('w daily');
  const isWCf = lc.startsWith('w cf');
  if (isWDaily || isWCf) {
    if (!ALLOWED_GAME_CHANNELS.has(cid)) {
      await message.reply(`⛔ Bu kanalda onu oynayamazsın kardeş. Şu kanala gel: <#${REDIRECT_CHANNEL_ID}>`).catch(() => {});
      const me = message.guild?.members?.me;
      if (me?.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
        await message.delete().catch(() => {});
      }
      return;
    }
  }

  // ===================== YAZI OYUNU (sadece belirlenen kanalda) =====================
  if (cid === TYPING_CHANNEL_ID) {
    // --- !yazıoyunu ---
    if (txt === '!yazıoyunu' || txt === '!yazioyunu' || txt === '!yazi-oyunu') {
      if (activeTypingGames.has(cid)) {
        return message.reply('⏳ Bu kanalda zaten aktif bir yazı oyunu var.');
      }
      const sentence = TYPING_SENTENCES[Math.floor(Math.random() * TYPING_SENTENCES.length)];
      await message.channel.send(
        `⌨️ **Yazı Oyunu** başlıyor! Aşağıdaki cümleyi **ilk ve doğru** yazan kazanır (noktalama önemsiz).\n` +
        `> ${sentence}\n` +
        `⏱️ Süre: **60 saniye**\n📌 **Günlük limit:** Aynı üye max **4 kez** ödül alabilir.`
      );
      const timeoutId = setTimeout(() => {
        if (activeTypingGames.has(cid)) {
          activeTypingGames.delete(cid);
          message.channel.send('⏰ Süre doldu! Kimse doğru yazamadı.');
        }
      }, 60_000);
      activeTypingGames.set(cid, { sentence, startedAt: Date.now(), timeoutId });
      return;
    }
    // --- Aktif oyunda doğru yazanı tespit et ---
    if (activeTypingGames.has(cid)) {
      if (!txt.startsWith('!')) {
        const game = activeTypingGames.get(cid);
        const target = normalizeTR(game.sentence);
        const guess = normalizeTR(message.content);
        if (guess && guess === target) {
          clearTimeout(game.timeoutId);
          activeTypingGames.delete(cid);
          const day = todayTR();
          const dKey = kDaily(gid, uid, day);
          const current = dailyTypingWins.get(dKey) || 0;
          if (current >= 4) {
            return void message.channel.send(
              `⛔ **${message.author}**, bugün Yazı Oyunundan alabileceğin **4 ödül sınırına** ulaştın. Yarın tekrar dene!`
            );
          }
          dailyTypingWins.set(dKey, current + 1);
          addCoins(gid, uid, 3);
          return void message.channel.send(
            `🏆 **${message.author}** doğru yazdı ve **+3 coin** kazandı! (Günlük yazı ödülün: **${current + 1}/4**)\n> _${game.sentence}_`
          );
        }
      }
    }
  }
  // =================== /YAZI OYUNU ===================

  // ===================== SARILMA OYUNU =====================
  if (txt.startsWith('!sarıl') || txt.startsWith('!saril')) {
    if (cid !== HUG_CHANNEL_ID) return message.reply(`⛔ Bu komut sadece <#${HUG_CHANNEL_ID}> kanalında kullanılabilir.`);
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Kime sarılmak istiyorsun babuş? !sarıl @kullanıcı şeklinde kullan.');
    }
    const msg = HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)];
    const gif = HUG_GIFS[Math.floor(Math.random() * HUG_GIFS.length)];
    if (target.id === uid) {
      return message.reply({ content: `**${message.author.username}**, kendine sarıldı… kendi kendini teselli etmek de bir sanattır 🤍`, files: [gif] });
    }
    return message.reply({ content: `**${message.author.username}**, **${target.username}**'e sarıldı! ${msg}`, files: [gif] });
  }
  // =================== /SARILMA OYUNU ===================

  // Sohbet liderliği sayacı (sadece belirlenen kanal)
  if (gid && cid === SOHBET_KANAL_ID) {
    const k = mKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
    // Günlük görev: mesaj sayacı
    incDaily(dailyQuestMsgs, gid, uid, 1);
  }

  // ----------- ÜYE YARDIM (her yerde) — (GÜNCELLENDİ/COIN) -----------
  if (txt === '!yardım' || txt === '!yardim') {
    const helpText =
`📘 **Fang Yuan Bot • Üye Yardım (Coin Ekonomisi)**

🎮 **Oyunlar (Tek Kasa: COIN)**
• \\!yazıoyunu — **<#${TYPING_CHANNEL_ID}>** kanalında 60 sn'lik yazı yarışı (günlük max 4 ödül).
• \\!yazı bonus — Günlük **+25** coin.
• \\!zar üst / \\!zar alt — 1–3 alt, 4–6 üst. Kazan: **+3**, Kaybet: **-1**. 2x kayıp: ek **-3** (Cooked).
• \\!zar bonus — Günlük **+25** coin.
• \\!coinsiralama — Coin sıralaması (alias: \\!oyunsıralama).
• \\!zar coin — Coin skor tablosu (alias: \\!zar puan).

🎁 **Şans Kutusu**
• \\!şanskutusu — Günde 5 kez. %20: **+10**, %20: **+15**, %20: **+20**, kalan %40: **+3**

🗓️ **Günlük Görevler**
• Hedef 1: Gün içinde **5 kez zar oyna** (\\!zar üst/alt).
• Hedef 2: **<#${QUEST_CHANNEL_ID}>** kanalına **30 mesaj** yaz.
• \\!görev — İlerlemeyi gösterir. \\!görev al — Tamamlanan her hedef için **+${30}** coin.

💞 **Evlilik**
• \\!market yüzük al — **${RING_PRICE} coin**, tek kullanımlık, iade edilmez.
• \\!evlen @üye — Onay/Red butonlu teklif. (başarılı olursa yüzük harcanır)
• \\!evlilik — Eşini gösterir.
• \\!boşan @üye — Onay/Red butonlu boşanma (**-20 coin** maliyet).

🛒 **Market**
• \\!yardimmarket — Market kullanımını ve rolleri gösterir.
• \\!rollerimarket — Satıştaki rol listesi ve fiyatlar.
• \\!market al <rolId> — Rol satın alır.
• \\!market iade <rolId> — Rol iadesi (rol bazlı iade; bazı rollerde %20 ve “ikinci el” notu).
• \\!yüzük — Envanterindeki yüzüğü gösterir.
• \\!coin — Coin bakiyen.
• \\!coin gonder @kisi <miktar> — Coin transferi.
• (Owner) \\!coin-ver @kisi <miktar> — Sınırsız coin verme.

💬 **Etkileşim**
• \\!sarıl @kullanıcı — **<#${HUG_CHANNEL_ID}>** kanalında sarılma GIF’i.
• \\@Fang Yuan Bot — “naber babuş”, “günaydın”, “moralim bozuk”, “çok mutluyum” vb.
• **LoL**: “**mainim <şampiyon>**” yaz; şampiyona özel cevap.
• **Çiçek**: “**en sevdiğim çiçek <isim>**” yaz; şık yanıt.

🕹️ **OwO Kısıtı**
• OwO komutları sadece: <#1369332479462342666>, <#${REDIRECT_CHANNEL_ID}>.

ℹ️ **Notlar**
• Tüm oyun/market/evlilik ekonomisi **sadece coin** ile çalışır.
• Bonuslar **günde 1 kez** alınır (İstanbul saatine göre).`;
    return void message.reply(helpText);
  }

  // ----------- EĞLENCE KOMUTLARI -----------
  if (txt.trim() === '!espiri') {
    const joke = ESPIRI_TEXTS[Math.floor(Math.random() * ESPIRI_TEXTS.length)];
    return void message.reply(joke);
  }
  if (txt === '!yazıtura' || txt === '!yazi-tura' || txt === '!yazı-tura') {
    const sonuc = Math.random() < 0.5 ? '🪙 **YAZI** geldi!' : '🪙 **TURA** geldi!';
    return void message.reply(`${sonuc} 🎲`);
  }

  // ---------- OYUN BONUSLARI (GÜNDE 1) — her biri +25 COIN ----------
  if (txt === '!yazı bonus' || txt === '!yazi bonus' || txt === '!yazıbonus' || txt === '!yazi-bonus') {
    if (!gid) return;
    const day = todayTR();
    const k = kDaily(gid, uid, day);
    if (dailyClaimYaziBonus.get(k)) {
      return message.reply('⛔ Bugünün **Yazı bonusunu** zaten aldın. Yarın tekrar gel babuş!');
    }
    dailyClaimYaziBonus.set(k, true);
    const total = addCoins(gid, uid, 25);
    return message.reply(`✅ **+25** Yazı bonusu eklendi! Coin bakiyen: **${total}**`);
  }
  if (txt === '!zar bonus' || txt === '!zarbonus' || txt === '!zar-bonus') {
    if (!gid) return;
    const day = todayTR();
    const k = kDaily(gid, uid, day);
    if (dailyClaimZarBonus.get(k)) {
      return message.reply('⛔ Bugünün **Zar bonusunu** zaten aldın. Yarın yine şansını dene!');
    }
    dailyClaimZarBonus.set(k, true);
    const total = addCoins(gid, uid, 25);
    return message.reply(`✅ **+25** Zar bonusu eklendi! Coin bakiyen: **${total}**`);
  }
});

// Daily chest map
const dailyChestCount = new Map(); // key dayKey -> count

// Şans Kutusu tek handler (COIN)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);
  if (txt === '!şanskutusu' || txt === '!sanskutusu' || txt === '!şans-kutusu' || txt === '!sans-kutusu') {
    if (!gid) return;
    const k = kDaily(gid, uid, todayTR());
    const used = dailyChestCount.get(k) || 0;
    if (used >= 5) return void message.reply('⛔ Bugün şans kutusunu zaten **5 kez** kullandın. Yarın tekrar gel!');
    const p = Math.random();
    let earn = 3;
    let good = false;
    if (p < 0.2) { earn = 10; good = true; }
    else if (p < 0.4) { earn = 15; good = true; }
    else if (p < 0.6) { earn = 20; good = true; }
    else { earn = 3; good = false; }
    dailyChestCount.set(k, used + 1);
    const total = addCoins(gid, uid, earn);
    if (good) {
      return void message.reply(`🎁 **İyi şans!** Kutudan **+${earn}** coin çıktı. Toplam: **${total}**`);
    } else {
      return void message.reply(`🎁 **Kötü şans babuş...** Yine de **+${earn}** coin aldın. Toplam: **${total}**`);
    }
  }
});

// ---------- ZAR (COIN) + GÖREV SAYACI ----------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  if (txt.startsWith('!zar')) {
    if (txt.trim() === '!zar coin' || txt.trim() === '!zar puan' || txt.trim() === '!zarpuan') {
      if (!gid) return;
      const top = guildTopCoins(gid, 10);
      if (!top.length) return message.reply('🏁 Henüz coin yok.');
      const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.coins}** coin`).join('\n');
      return message.reply(`🎯 **Coin Sıralaması (Zar & Oyunlar)**\n${table}`);
    }
    const parts = txt.trim().split(/\s+/);
    const secimRaw = parts[1] || '';
    const secim = secimRaw.replace('ust', 'üst');
    if (!['üst', 'alt'].includes(secim)) {
      return void message.reply('Kullanım: !zar üst veya !zar alt\nKural: **1-3 = alt**, **4-6 = üst**');
    }
    const roll = Math.floor(Math.random() * 6) + 1; // 1..6
    const sonuc = roll <= 3 ? 'alt' : 'üst';
    const kazandi = secim === sonuc;
    const key = cKey(gid, uid);
    let delta = 0;
    let extraNote = '';
    let gif = DICE_GIFS[Math.floor(Math.random() * DICE_GIFS.length)];
    if (kazandi) {
      delta = +3;
      diceLossStreak.set(key, 0);
    } else {
      const newStreak = (diceLossStreak.get(key) || 0) + 1;
      diceLossStreak.set(key, newStreak);
      delta = -1;
      if (newStreak >= 2) {
        delta -= 3; // toplam -4
        extraNote = '\n🔥 **Cooked!** İki kez üst üste kaybettin, **-3 coin ceza.**';
        gif = COOKED_GIFS[Math.floor(Math.random() * COOKED_GIFS.length)];
        diceLossStreak.set(key, 0);
      }
    }
    const total = addCoins(gid, uid, delta);
    // Günlük görev: zar sayacı
    incDaily(dailyDicePlays, gid, uid, 1);
    const baseText = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}** ${ kazandi ? 'Kazandın 🎉 (**+3** coin)' : 'Kaybettin 😿 (**-1** coin)' }\n📦 Coin bakiyen: **${total}**`;
    return void message.reply({ content: `${baseText}${extraNote}`, files: [gif] });
  }
});

// --------- COIN SIRALAMA & KISA YOL KOMUTLARI ---------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const txt = tLower(message.content);

  if (txt === '!oyunsıralama' || txt === '!oyunsiralama' || txt === '!coinsiralama' || txt === '!coin-sıralama' || txt === '!coin-siralama') {
    if (!gid) return;
    const top = guildTopCoins(gid, 10);
    if (!top.length) return message.reply('🏁 Henüz coin yok.');
    const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.coins}** coin`).join('\n');
    return message.reply(`📊 **Coin Skor Tablosu**\n${table}`);
  }
  if (txt === '!yazıpuan' || txt === '!yazipuan' || txt === '!yazi-puan' || txt === '!yazi-coin' || txt === '!yazicoin') {
    if (!gid) return;
    const top = guildTopCoins(gid, 10);
    if (!top.length) return message.reply('🏁 Henüz coin yok.');
    const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.coins}** coin`).join('\n');
    return message.reply(`📊 **Coin Skor Tablosu**\n${table}`);
  }
});

// ----------- GÜNLÜK GÖREV KOMUTLARI -----------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);
  if (!gid) return;

  if (txt === '!görev' || txt === '!gorev') {
    const d = getDaily(dailyDicePlays, gid, uid);
    const m = getDaily(dailyQuestMsgs, gid, uid);
    const k = kDaily(gid, uid, todayTR());
    const claimed = questClaimed.get(k) || false;
    const line1 = `🎲 Zar: **${d}/${QUEST_DICE_TARGET}**`;
    const line2 = `💬 Mesaj (<#${QUEST_CHANNEL_ID}>): **${m}/${QUEST_MSG_TARGET}**`;
    const tip = claimed ? '✔️ Bugünün ödülünü aldın.' : '🎁 Tamamlayınca **!görev al** yaz.';
    return void message.reply(`🗓️ **Günlük Görevler**\n${line1}\n${line2}\n${tip}`);
  }
  if (txt === '!görev al' || txt === '!gorev al') {
    const d = getDaily(dailyDicePlays, gid, uid);
    const m = getDaily(dailyQuestMsgs, gid, uid);
    const k = kDaily(gid, uid, todayTR());
    if (questClaimed.get(k)) return void message.reply('⛔ Bugünün ödülünü zaten aldın.');
    let reward = 0;
    if (d >= QUEST_DICE_TARGET) reward += QUEST_REWARD;
    if (m >= QUEST_MSG_TARGET) reward += QUEST_REWARD;
    if (reward <= 0) return void message.reply('⛔ Henüz görevleri tamamlamadın. Durumu **!görev** ile kontrol et.');
    questClaimed.set(k, true);
    const total = addCoins(gid, uid, reward);
    return void message.reply(`✅ Görev ödülü: **+${reward}** coin! Yeni bakiye: **${total}**`);
  }
});

// ----------- YETKİLİ YARDIM / MODERATION (kısaltılmış) -----------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  if (txt === '!yardımyetkili' || txt === '!yardimyetkili' || txt === '!help-owner') {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    const isOwner = OWNERS.includes(uid);
    const hasRole = hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES) || hasAnyRole(message.member, MUTE_ALLOWED_ROLES);
    if (!isOwner && !hasRole) {
      return message.reply('⛔ Bu yardımı görme yetkin yok.');
    }
    const adminHelp = `🛠️ **Yönetici/Owner Yardımı**
**Moderasyon**
• **!ban <kullanıcıId>** — (Owner) Kullanıcıyı yasaklar.
• **!unban <kullanıcıId>** — (Owner) Banı kaldırır.
• **!mute <kullanıcıId> <dakika>** — Zaman aşımı.
• **!sohbet-sil <1–100>** — (Owner) Toplu silme.

**Sayaç/İstatistik**
• **!sohbet-sifirla** — Sohbet sayaçlarını temizler.
• **!ses-sifirla** — Ses istatistiklerini sıfırlar.

**Yazı Oyunu**
• **!yazıiptal** — (Owner) Aktif yarışmayı iptal eder.`;
    return void message.reply(adminHelp);
  }
});

// ====================== ÇİÇEK & LOL DİYALOĞU ======================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const txt = tLower(message.content);

  if (txt.includes('en sevdiğin çiçek ne baba')) {
    return void message.reply('En sevdiğim çiçek güldür, anısı da var 😔 Seninki ne?');
  }
  if (/en sevdiğim çiçek/i.test(txt)) {
    const raw = message.content.replace(/<@!?\d+>/g, '').trim();
    const m = raw.match(/en sevdiğim çiçek\s+(.+)/i);
    const userSaid = (m && m[1] ? m[1] : '').trim().replace(/\s+/g, ' ').replace(/[.,!?]+$/, '');
    const found = FLOWER_LIST.find((f) => trLower(userSaid).includes(trLower(f)));
    const replyText = FLOWER_RESPONSES[Math.floor(Math.random() * FLOWER_RESPONSES.length)];
    if (found) return void message.reply(replyText);
    else return void message.reply(`Ooo ${(userSaid || 'bu çiçeği')} mi diyorsun? 🌼 ${replyText}`);
  }

  if (txt.includes('en sevdiğin lol karakteri') || txt.includes('en sevdigin lol karakteri')) {
    return void message.reply('En sevdiğim karakter **Zed** 💀 babasıyımdır; senin mainin ne?');
  }
  if (/mainim\s+([a-zA-Zçğıöşü\s'.-]+)/i.test(txt)) {
    const match = txt.match(/mainim\s+([a-zA-Zçğıöşü\s'.-]+)/i);
    const champ = match ? match[1].trim().toLowerCase() : null;
    if (champ) {
      const found = Object.keys(LOL_RESPONSES).find((c) => champ.includes(c));
      if (found) return void message.reply(LOL_RESPONSES[found]);
      else return void message.reply(`Ooo ${champ}? Yeni meta mı çıktı babuş 😏`);
    }
  }
});

// ----------- REPLY TABANLI OTOMATİK CEVAPLAR & MENTIONS -----------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const cid = message.channel?.id;
  const txt = message.content.toLocaleLowerCase('tr').trim();

  await handleReplyReactions(message);

  if (message.mentions.users.has(client.user.id)) {
    const found = PERSONAL_RESPONSES.find((item) => txt.includes(item.key));
    if (found) {
      if (PERSONAL_CHAT_CHANNELS.has(cid)) {
        const reply = pickOne(found.answers);
        return void message.reply(reply);
      } else {
        return void message.reply(PERSONAL_CHAT_REDIRECT);
      }
    }
    if (txt.includes('moralim bozuk')) {
      const reply = SAD_REPLIES[Math.floor(Math.random() * SAD_REPLIES.length)];
      return void message.reply(reply);
    }
    if (txt.includes('çok mutluyum') || txt.includes('cok mutluyum')) {
      const reply = HAPPY_REPLIES[Math.floor(Math.random() * HAPPY_REPLIES.length)];
      return void message.reply(reply);
    }
    // 👉 Gay / Lez
    if (/(gay ?m[iı]sin|gaym[iı]s[iı]n|lez ?m[iı]sin|lezbiyen ?m[iı]sin|lezm[iı]s[iı]n)/i.test(txt)) {
      return void message.reply({ content: 'hmmmm… düşünmem lazım 😶‍🌫️ sanırım gayım… ne bileyim ben 🤔', files: [ORIENTATION_PHOTO_URL] });
    }
    if (txt.includes('teşekkürler sen')) return void message.reply('iyiyim teşekkürler babuş👻');
    if (txt.includes('teşekkürler')) return void message.reply('rica ederim babuş👻');
    if (txt.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
    if (txt.includes('naber babuş')) return void message.reply('iyiyim sen babuş👻');
    if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim')) return void message.reply('süper hep iyi ol ⭐');

    if (/(günaydın|gunaydin)/.test(txt)) return void message.reply('Günaydın babuş ☀️ yüzünü yıkamayı unutma!');
    if (/(iyi akşamlar|iyi aksamlar)/.test(txt)) return void message.reply('İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏');

    const onlyMention = message.content.replace(/<@!?\d+>/g, '').trim().length === 0;
    if (onlyMention) return void message.reply('naber babuş 👻');
  }
});

// ----------- İSTATİSTİK KOMUTLARI -----------
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  if (txt === '!ses') {
    if (!gid) return;
    const data = [];
    for (const [k, sec] of totals) if (k.startsWith(`${gid}:`)) data.push({ uid: k.split(':')[1], sec });
    if (!data.length) return message.reply('Ses kanalları bomboş... yankı bile yok 😴');
    data.sort((a, b) => b.sec - a.sec);
    const top = data.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`).join('\n');
    return void message.reply(`🎙️ **Ses Liderliği Paneli**\n${top}`);
  }
  if (txt === '!sesme') {
    if (!gid) return;
    const k = vKey(gid, uid);
    let totalSec = totals.get(k) || 0;
    if (joinTimes.has(k)) totalSec += Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    if (!totalSec) return message.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    return void message.reply(`🎧 **${message.author.username}**, toplam ses süren: **${formatTime(totalSec)}** ⏱️`);
  }
  if (txt === '!sohbet') {
    if (!gid) return;
    const arr = [];
    for (const [k, count] of messageCount) {
      if (k.startsWith(`${gid}:${SOHBET_KANAL_ID}:`)) arr.push({ uid: k.split(':')[2], count });
    }
    if (!arr.length) return message.reply('Bu kanalda henüz mesaj yazılmamış 💤');
    arr.sort((a, b) => b.count - a.count);
    const top = arr.slice(0, 10).map((r, i) => `**${i + 1}.** <@${r.uid}> — ${r.count} mesaj`).join('\n');
    return message.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${top}`);
  }
});

// ====================== EVLİLİK KOMUTLARI (COIN) ======================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  // !evlilik — eşini göster
  if (txt === '!evlilik' || txt === '!evli') {
    if (!gid) return;
    if (!isMarried(gid, uid)) return void message.reply('💍 Evli değilsin.');
    const sp = spouseOf(gid, uid);
    return void message.reply(`💞 Eşin: <@${sp}>`);
  }

  // !evlen @üye
  if (txt.startsWith('!evlen')) {
    if (!gid) return;
    const target = message.mentions.users.first();
    if (!target) return void message.reply('Kullanım: `!evlen @kullanıcı`');
    if (target.bot) return void message.reply('Botlarla evlenemezsin 😅');
    if (target.id === uid) return void message.reply('Kendi kendinle evlenemezsin :)');
    if (isMarried(gid, uid)) return void message.reply('⛔ Zaten evlisin, önce boşanmalısın.');
    if (isMarried(gid, target.id)) return void message.reply('⛔ Hedef kişi zaten evli görünüyor.');
    if (getRings(gid, uid) <= 0) return void message.reply('⛔ Teklif etmek için **yüzüğün** yok. `!market yüzük al`');

    const acceptId = `marry_ok_${uid}_${target.id}_${Date.now()}`;
    const denyId   = `marry_no_${uid}_${target.id}_${Date.now()}`;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(acceptId).setLabel('Evet 💍').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(denyId).setLabel('Hayır ❌').setStyle(ButtonStyle.Danger),
    );
    const prompt = await message.channel.send({ content: `💍 ${target} — **${message.author.tag}** seninle evlenmek istiyor!`, components: [row] });
    const collector = prompt.createMessageComponentCollector({
      componentType: ComponentType.Button, time: 60_000,
      filter: (i) => (i.customId === acceptId || i.customId === denyId) && i.user.id === target.id,
    });
    let decided = false;
    collector.on('collect', async (i) => {
      decided = true;
      if (i.customId === acceptId) {
        // Teklif başarılı → yüzük harcanır
        if (isMarried(gid, uid) || isMarried(gid, target.id)) {
          return i.update({ content: '⛔ Geç kaldın; taraflardan biri artık evli görünüyor.', components: [] });
        }
        if (getRings(gid, uid) <= 0) {
          return i.update({ content: '⛔ Teklif sahibi yüzüğünü kaybetti gibi… tekrar dene.', components: [] });
        }
        addRings(gid, uid, -1);
        marry(gid, uid, target.id);
        await i.update({ content: `💞 **${message.author.tag}** ile **${target.tag}** artık **evli!** (yüzük harcandı)`, components: [] });
      } else {
        await i.update({ content: `💔 **${target.tag}** teklifi **reddetti**.`, components: [] });
      }
    });
    collector.on('end', async () => {
      if (!decided) try { await prompt.edit({ content: '⌛ Süre doldu, evlilik teklifi geçersiz.', components: [] }); } catch {}
    });
    return;
  }

  // !boşan @üye  — **-20 coin**
  if (txt.startsWith('!boşan') || txt.startsWith('!bosan')) {
    if (!gid) return;
    const target = message.mentions.users.first();
    if (!target) return void message.reply('Kullanım: `!boşan @kullanıcı`');
    if (!isMarried(gid, uid)) return void message.reply('⛔ Evli değilsin.');
    const sp = spouseOf(gid, uid);
    if (sp !== target.id) return void message.reply('⛔ Bu kişi senin eşin değil.');

    const okId = `div_ok_${uid}_${target.id}_${Date.now()}`;
    const noId = `div_no_${uid}_${target.id}_${Date.now()}`;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(okId).setLabel('Evet (boşanalım)').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(noId).setLabel('Hayır (devam)').setStyle(ButtonStyle.Secondary),
    );
    const prompt = await message.channel.send({ content: `⚖️ ${target} — **${message.author.tag}** boşanma istiyor, kabul ediyor musun? (**-20 coin** maliyet)`, components: [row] });
    const collector = prompt.createMessageComponentCollector({
      componentType: ComponentType.Button, time: 60_000,
      filter: (i) => (i.customId === okId || i.customId === noId) && i.user.id === target.id,
    });
    let decided = false;
    collector.on('collect', async (i) => {
      decided = true;
      if (i.customId === okId) {
        // Para düş
        const bal = getCoins(gid, uid);
        if (bal < 20) {
          return i.update({ content: '⛔ Boşanma için **20 coin** gerekiyor; bakiyen yetersiz.', components: [] });
        }
        setCoins(gid, uid, bal - 20);
        divorce(gid, uid, target.id);
        await i.update({ content: `🫶 **${message.author.tag}** ve **${target.tag}** **boşandı.** (**-20 coin**)`, components: [] });
      } else {
        await i.update({ content: `💍 **${target.tag}** boşanmayı **reddetti**. Evli kalmaya devam.`, components: [] });
      }
    });
    collector.on('end', async () => {
      if (!decided) try { await prompt.edit({ content: '⌛ Süre doldu, boşanma isteği iptal edildi.', components: [] }); } catch {}
    });
    return;
  }
});

// ====================== OWNER KOMUTLARI (kısaltılmış) ======================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const gid = message.guild?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);

  if (txt === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) {
      for (const k of [...totals.keys()]) if (k.startsWith(`${gid}:`)) totals.delete(k);
      for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`🎙️ ${label} — Ses verileri sıfırlandı!`);
  }
  if (txt === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`💬 ${label} — Sohbet liderliği sıfırlandı!`);
  }
});

// ====================== READY / HAZIR ==========================
client.once('ready', async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: 'Fang Yuan | !yardım', type: ActivityType.Playing }], status: 'online' });

  // 🔔 ÜYE REHBERİ MESAJI — bot açıldığında otomatik gönder
  try {
    const channel = await client.channels.fetch(GUIDE_CHANNEL_ID).catch(() => null);
    if (channel) {
      const guide =
`🐉 **Fang Yuan Bot • Üye Rehberi (Coin Ekonomisi)**

Selam dostum 👋 Ben **Fang Yuan Bot**! Artık **tek kasalı** ekonomi tamamen **coin** ile çalışıyor: Zar + Yazı + Market + Evlilik aynı kasayı kullanır.

🎮 **Kısayollar**
• !yazıoyunu — 60 sn yazı yarışı (**<#${TYPING_CHANNEL_ID}>**) | Günlük yazı ödülü limiti: **4**
• !yazı bonus / !zar bonus — Her biri **günde +25 coin** (İstanbul gününe göre)
• !zar üst / !zar alt — Kazan: +3 | Kaybet: -1 | 2x kayıp = ek -3 (COOKED)
• !şanskutusu — Günde 5 kez, rastgele ödüller
• !görev — Günlük hedefler
• !coinsiralama — Coin sıralaması
• !yardım — Tüm komut listesi

💍 **Evlilik**
• !market yüzük al → yüzük satın al (iadesiz, ${RING_PRICE} coin)
• !evlen @üye → onay/red butonlu teklif
• !evlilik → eşini gör
• !boşan @üye → onay/red butonlu boşanma (**-20 coin**)

İyi eğlenceler babuş 💫`;
      await channel.send(guide);
      console.log('📘 Üye rehberi mesajı gönderildi!');
    } else {
      console.warn('⚠️ Rehber gönderilecek kanal bulunamadı.');
    }
  } catch (e) {
    console.error('Rehber mesajı gönderilemedi:', e);
  }
});

// ====================== GÜVENLİ LOGIN & OTO-RETRY ======================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || '';
if (!TOKEN) {
  console.error('⛔ DISCORD_TOKEN bulunamadı. .env dosyana DISCORD_TOKEN=... ekle!');
  process.exit(1);
}
client.on('shardError', (e) => console.error('🔌 ShardError:', e));
client.on('error', (e) => console.error('🧨 Client error:', e));
client.on('warn', (m) => console.warn('⚠️ Warn:', m));
client.on('shardDisconnect', (event, shardId) => {
  console.warn(`🔌 Shard ${shardId} bağlantı koptu:`, event?.code, event?.reason || '');
});
client.on('shardReconnecting', (shardId) => console.log(`♻️ Shard ${shardId} yeniden bağlanıyor...`));
client.on('shardReady', (shardId) => console.log(`✅ Shard ${shardId} hazır`));
client.on('resume', () => console.log('🔁 Oturum devam ediyor (resume)'));
async function startBot() {
  try {
    console.log('🔑 Login deneniyor...');
    await client.login(TOKEN);
    console.log('✅ Login başarılı!');
  } catch (err) {
    console.error('⛔ Login başarısız! 15 sn sonra yeniden denenecek.\nHata:', err?.message || err);
    setTimeout(startBot, 15000);
  }
}
startBot();

// (Render/Railway gibi hostlar için) kendini sıcak tut
setInterval(() => {
  try {
    client.user?.setPresence({ activities: [{ name: 'Fang Yuan | !yardım', type: ActivityType.Playing }], status: 'online' });
  } catch {}
}, 14 * 60 * 1000);

// ====================== GENEL HATA YAKALAYICI ===================
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));
"""
with open('/mnt/data/index_with_marriage_tasks_chest_COINS.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("Wrote file:", "/mnt/data/index_with_marriage_tasks_chest_COINS.js")
