
// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  AuditLogEvent,
  ActivityType,
  PermissionFlagsBits,
  // ⬇️ Butonlu "ÇAL" mini oyunu için gerekenler
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
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
const ORIENTATION_PHOTO_URL =
  'https://i.kym-cdn.com/photos/images/newsfeed/003/107/283/053.jpg';

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
const PERSONAL_CHAT_REDIRECT =
  '⛔ Bu sorulara burada cevap veremiyorum, lütfen <#1413929200817148104>, <#1268595926226829404> veya <#1433137197543854110> kanalına gel 💬';

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
  'Ay’da rüzgâr yok; bayraklar yine de gönlümüzde dalgalanıyor.',
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
const FLOWER_LIST = [
  'gül','lale','papatya','orkide','zambak','menekşe','karanfil','nergis','sümbül','yasemin','şebboy',
  'frezya','çiğdem','kamelya','begonya','kaktüs','lavanta','hanımeli','nilüfer','akasya','kasımpatı',
  'manolya','gardenya','ortanca','fulya','sardunya','melisa','gülhatmi','mor salkım','pembe karanfil',
  'beyaz gül','kırmızı gül','mavi orkide','tulip','daffodil','sunflower','lotus','iris','aster','kardelen',
  'şakayık','zerrin','yılbaşı çiçeği','camgüzeli','glayöl','kar çiçeği','itır','mine','begonvil','nane çiçeği',
  'petunya','fitonya','antoryum','orkisya','fırfır çiçeği','papatyagiller','melati','süsen','çiçekli kaktüs',
  'bambu çiçeği','kudret narı çiçeği','leylak','ağaç minesi','filbaharı','ateş çiçeği','sarmaşık','zehra çiçeği',
  'aloe çiçeği','yaban gülü','gelincik','defne çiçeği','sümbülteber','agnus','mimoza','çiçekli sarmaşık',
  'dağ laleleri','krizantem','akgül','portakal çiçeği','limon çiçeği','yenibahar çiçeği','barış çiçeği',
  'gelin çiçeği','beyaz orkide','mavi menekşe','zümbül','yaban sümbül','narcissus','vadi zambağı','tropik orkide',
  'sakura','çiçek açan kaktüs','mine çiçeği','orkidya','çiçekçi gülü','zarif orkide','badem çiçeği','nergiz','fulya çiçeği',
];
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

// ====================== LOL KARAKTER DİYALOĞU ======================
const LOL_RESPONSES = {
  zed: 'Ah, Zed 💀 gölgelerin babasıyımdır zaten 😏',
  yasuo: 'Yasuo mu? Rüzgar seninle olsun, ama FF 15 olmasın 🌪️',
  yone: 'Yone... kardeşim ama hâlâ gölgeme basamaz 😎',
  ahri: 'Ahri 🦊 o gözlerle herkes kaybolur babuş.',
  akali: 'Akali 🔪 sessiz, ölümcül ve karizmatik. onayladım.',
  lux: 'Lux 🌟 ışığın kızı, moralin bozuksa ışığı yak 😌',
  jinx: 'Jinx 🎇 deliliğin sesi! kaosun tatlı hali.',
  caitlyn: 'Caitlyn 🎯 her mermi sayılır, iyi nişan babuş.',
  vi: 'Vi 👊 tokadı sağlam atarsın, dikkat et mouse kırılmasın.',
  thresh: 'Thresh ⚰️ ruh koleksiyonumda sana da yer var 😈',
  'lee sin': 'Lee Sin 🥋 kör ama carry atan tek adam.',
  blitzcrank: 'Blitz 🤖 hook tutarsa rakip oyun kapatır 😏',
  morgana: 'Morgana 🌑 zincirleri kır babuş, kaderini yaz.',
  kayle: 'Kayle 👼 adaletin meleği, ama sabırlı oyna 😅',
  ezreal: 'Ezreal ✨ macera seni çağırıyor, loot’u bana bırak.',
  darius: 'Darius ⚔️ baltayı konuşturuyorsun yine 😎',
  garen: 'Garen 💙 Demaciaaaa! klasik ama asil seçim.',
  vayne: 'Vayne 🏹 karanlıkta av, sabah efsane 💅',
  teemo: 'Teemo 😡 seninle konuşmuyorum... gözüm twitchliyor.',
  riven: 'Riven ⚔️ kırılmış ama hâlâ güçlü, tıpkı kalbim gibi.',
  irelia: 'Irelia 💃 bıçak dansı estetik ama ölümcül 💀',
  kayn: 'Kayn 😏 karanlık taraf mı aydınlık taraf mı babuş?',
  aatrox: 'Aatrox ⚔️ sonsuz savaşın çocuğu. sabah 5’te bile tilt.',
  ekko: 'Ekko ⏳ zamanı bük, geçmişi düzeltme, geleceği yaz babuş.',
  veigar: 'Veigar 😈 kısa boy, büyük ego. saygı duyarım.',
  sett: 'Sett 💪 karizma tavan, ama saç jölesine dikkat 😏',
  mordekaiser: 'Mordekaiser 💀 realmime hoş geldin babuş.',
  zoe: 'Zoe 🌈 tatlı ama baş belası, dikkat et 😜',
  soraka: 'Soraka 🌿 iyileştir ama kalbini kaptırma 💫',
  draven: 'Draven 🎯 ego level 9000, senin gibi havalı babuş.',
  ashe: 'Ashe ❄️ buz gibi ama cool, klasik support hedefi 😏',
  malphite: 'Malphite 🪨 duygusuz ama sağlam. taştan yapılmış babuş.',
  singed: 'Singed ☠️ koşarak zehir bırak, arkanı dönme 😭',
  heimerdinger: 'Heimer 🧠 kulelerinle bile konuşurum bazen 😂',
  zyra: 'Zyra 🌿 doğa güzel ama sen tehlikelisin babuş.',
  brand: 'Brand 🔥 yangın var babuş, sen mi yaktın?',
  annie: 'Annie 🧸 tibbers nerede?! çocuğa dikkat et 😱',
  nasus: 'Nasus 🐕 300 stack mi? yoksa afk farm mı?',
  renekton: 'Renekton 🐊 kardeşin Nasus seni hâlâ affetmedi 😬',
  karma: 'Karma 🕉️ dengede kal, yoksa ben dengesizleşirim 😌',
  syndra: 'Syndra ⚫ toplar havada uçuşsun, ama lag olmasın 😭',
  nidalee: 'Nidalee 🐆 mızraklar can yakıyor, sakin ol vahşi kedi.',
  xayah: 'Xayah 🪶 Rakan olmadan da güzelsin 😏',
  rakan: 'Rakan 💃 Xayah olmadan da flört ediyorsun, bravo 😂',
  jax: 'Jax 🪓 lamba sopasıyla dövüşen adam... saygı duyuyorum.',
  pantheon: 'Pantheon 🛡️ tanrılara kafa tutuyorsun, kahramansın babuş.',
  talon: 'Talon 🔪 sessizce gelir, reportları toplar 😎',
  pyke: 'Pyke ⚓ öldürdüklerini saymamışsın, ben tuttum 😏',
  katarina: 'Katarina 🔪 döner bıçakları ustalıkla kullanıyorsun 😌',
  leblanc: 'LeBlanc 🎭 sahtekar, ama stilin yerinde 😏',
  lucian: 'Lucian 🔫 çift tabancalı adalet, hızlı ve öfkeli.',
  senna: 'Senna 💀 karanlıkta ışık arayan, asil bir ruh.',
  samira: 'Samira 💋 stilli, havalı, ölümlülerin en güzeli.',
  viego: 'Viego 💔 karısını hâlâ unutmamış, ben bile üzüldüm.',
  lillia: 'Lillia 🦌 tatlısın ama rüyalar korkutucu 😴',
  kindred: 'Kindred 🐺 ölüm bile seninle dost olmuş babuş.',
  yuumi: 'Yuumi 📚 kedisin diye sevimlisin ama can sıkıyorsun 😾',
  graves: 'Graves 💨 puro + pompalı = tarz sahibi babuş.',
  warwick: 'Warwick 🐺 kokunu aldım, kanın taze 😈',
  shaco: 'Shaco 🤡 kaosu sevdim ama bana yaklaşma 😱',
  nocturne: 'Nocturne 🌑 karanlıkta fısıldayan kabus, hoş geldin 😨',
  fiddlesticks: 'Fiddle 🌾 sessiz ol... o seni duyuyor 😰',
  olaf: 'Olaf 🪓 rage mode açıldı, dikkat et elini kesme 😅',
  shen: 'Shen 🌀 sabır ustası, teleportun zamanında 👍',
  rammus: 'Rammus 🐢 okkeeeey 💨',
  amumu: 'Amumu 😭 gel sarılalım dostum.',
  tryndamere: 'Tryndamere ⚔️ ölmüyorsun, tilt ediyorsun 😭',
  nunu: 'Nunu ☃️ en tatlı jungler, kartopu büyüklüğünde ❤️',
  illaoi: 'Illaoi 🐙 tentakül tanrıçası, güçlü ama sert 😬',
  yorick: 'Yorick ⚰️ mezarlıkta bile yalnız değilsin bro 😔',
  tristana: 'Tristana 💥 küçük ama patlayıcı!',
  ziggs: 'Ziggs 💣 patlamayı severim ama sen fazla seviyorsun 😂',
  cassiopeia: 'Cassiopeia 🐍 tehlikeli bakışlar, taş kesildim resmen 😳',
  nami: 'Nami 🌊 su gibi güzel, ama dalgan çok sert 😅',
  seraphine: 'Seraphine 🎤 güzel ses, ama biraz az konuş 😏',
  taric: 'Taric 💎 parlaklığın göz alıyor, kıskandım 😍',
};

// Yeni eklemeler (eksikleri tamamlar)
const LOL_NEW = { /* …(kısaltıldı: yeni şampiyon varsa buraya ekleyebilirsin)… */ };
for (const [k, v] of Object.entries(LOL_NEW)) {
  if (!(k in LOL_RESPONSES)) LOL_RESPONSES[k] = v;
}

// ====================== (YENİ) TEK KASA OYUN SİSTEMİ ======================
const gamePoints = new Map(); // key: gid:uid -> pts (değiştirmedik; sadece metinlerde coin)
const dailyTypingWins = new Map(); // key: gid:uid:YYYY-MM-DD -> count
const dailyClaimYaziBonus = new Map(); // key: gid:uid:YYYY-MM-DD -> true
const dailyClaimZarBonus  = new Map(); // key: gid:uid:YYYY-MM-DD -> true

function kGame(gid, uid) { return `${gid}:${uid}`; }
function kDaily(gid, uid, day) { return `${gid}:${uid}:${day}`; }
function todayTR() {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, month, year] = fmt.format(d).split('.');
  return `${year}-${month}-${day}`;
}
function addPoints(gid, uid, delta) {
  const key = kGame(gid, uid);
  gamePoints.set(key, (gamePoints.get(key) || 0) + delta);
  return gamePoints.get(key);
}
function guildTop(gid, limit = 10) {
  const rows = [];
  for (const [k, pts] of gamePoints.entries()) {
    if (k.startsWith(gid + ':')) rows.push({ uid: k.split(':')[1], pts });
  }
  rows.sort((a,b)=>b.pts-a.pts);
  return rows.slice(0, limit);
}

/* =======================================================================
   >>>>>>>>>>>>  MARKET SİSTEMİ • TAM BLOK (YENİDEN YAZILDI)  <<<<<<<<<<
   - !market                → Tüm marketi göster (roller + eşyalar/güçlendirmeler)
   - !rollerimarket         → Sadece rol listesi
   - !market al <rolId>     → Rol satın al
   - !market iade <rolId>   → Rol iadesi (normal %50, premium %20 = “ikinci el”)
   - !coin                  → Coin bakiyeni göster
   - !coin gonder @kisi N   → Coin transferi
   - !coin-ver @kisi N      → (Owner) sınırsız coin verme
======================================================================= */

const ROLE_PRICE = 180;                 // Normal market rolü fiyatı
const PREMIUM_ROLE_PRICE = 400;         // Premium rol fiyatı
const PREMIUM_REFUND_RATE = 0.20;       // Premium iade oranı

// ——— Market "Eşyalar / Güçlendirmeler" (sadece gösterim + komut bilgisi) ———
const ITEM_SHANS_KUTUSU_PRICE = 8;      // !şanskutusu
const RING_PRICE_VIEW = (typeof RING_PRICE !== 'undefined' ? RING_PRICE : 150); // !yüzük al
const XPBOOST_PRICE = 200;              // !xpboost (kalıcı 1.5x görev kazancı)

// ——— Normal & Premium rol ID’leri (sende var olanlar) ———
const MARKET_ROLE_IDS = [
  '1433390462084841482',
  '1433390212138143917',
  '1433389941555073076',
  '1433389819337375785',
  '1433389663904862331',
];
const PREMIUM_ROLE_IDS = [
  '1433695194976616558',
  '1433695886327808092',
  '1433915275345920130',
];

// ——— Yardımcılar ———
const __MARKET__FALLBACK_OWNERS = (typeof OWNERS !== 'undefined' && Array.isArray(OWNERS)) ? OWNERS : [];
const __MARKET__LABEL = (typeof OWNER_LABEL !== 'undefined' && OWNER_LABEL) ? OWNER_LABEL : {};
const __MARKET__POINTS_MAP = (typeof gamePoints !== 'undefined' && gamePoints instanceof Map)
  ? gamePoints
  : (globalThis.__MARKET_POINTS__ ||= new Map());

function __mkKey(gid, uid) { return `${gid}:${uid}`; }
function getPoints(gid, uid) { return __MARKET__POINTS_MAP.get(__mkKey(gid, uid)) || 0; }
function setPoints(gid, uid, val) {
  const v = Math.max(0, Math.floor(Number(val) || 0));
  __MARKET__POINTS_MAP.set(__mkKey(gid, uid), v);
  return v;
}
function parseAmount(lastToken) {
  const n = Math.floor(Number(String(lastToken).replace(/[^\d-]/g, '')));
  return Number.isFinite(n) ? n : NaN;
}
function isPremium(roleId) { return PREMIUM_ROLE_IDS.includes(roleId); }
function getRolePriceById(roleId) { return isPremium(roleId) ? PREMIUM_ROLE_PRICE : ROLE_PRICE; }
function getRefundById(roleId) {
  const price = getRolePriceById(roleId);
  return isPremium(roleId) ? Math.floor(price * PREMIUM_REFUND_RATE) : Math.floor(price / 2);
}
// Üye şimdiden market rollerinden birine sahip mi?
function getOwnedMarketRoleId(member) {
  const ALL = [...MARKET_ROLE_IDS, ...PREMIUM_ROLE_IDS];
  return ALL.find(rid => member.roles.cache.has(rid)) || null;
}

// ——— Komutlar ———
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const gid = message.guild?.id;
    const uid = message.author.id;
    const txt = (message.content || '').toLocaleLowerCase('tr').trim();

    // ----------------- !market (YENİ: yardimmarket yerine geçti) -----------------
    if (txt === '!market') {
      if (!message.guild) return;

      const normalRefund = Math.floor(ROLE_PRICE / 2);
      const normalLines = MARKET_ROLE_IDS.length
        ? MARKET_ROLE_IDS.map((rid, i) =>
            `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${ROLE_PRICE} coin** (iade: **${normalRefund}**)`
          ).join('\n')
        : '_(Normal market boş)_';

      const premiumLines = PREMIUM_ROLE_IDS.length
        ? PREMIUM_ROLE_IDS.map((rid, i) =>
            `**P${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${PREMIUM_ROLE_PRICE} coin** (iade: **${getRefundById(rid)}**, “ikinci el olmuş”)`
          ).join('\n')
        : '_(Premium market boş)_';

      const itemsBlock = [
        `🎲 **Şans Kutusu** — **${ITEM_SHANS_KUTUSU_PRICE} coin**  •  Komut: \`!şanskutusu\``,
        `💍 **Evlilik Yüzüğü** — **${RING_PRICE_VIEW} coin**  •  Komut: \`!yüzük al\`  (teklif: \`!evlen @kişi\`)`,
        `💎 **XPBoost** (Kalıcı **1.5x** Günlük Görev Kazancı) — **${XPBOOST_PRICE} coin**  •  Komut: \`!xpboost\``,
      ].join('\n');

      const premiumNote =
        '🔸 **Premium neden pahalı?** Bu 3 adamdan birinin **çırağı** olursun; ' +
        '**takma ad değiştirme** ve **sohbet kanallarına dosya atma** gibi ek yetkiler sağlar.';

      const singleRule =
        '🔒 **Kural:** Aynı anda **en fazla 1** market rolüne sahip olabilirsin (normal veya premium). ' +
        'Yeni bir rol almak için mevcut rolünü önce iade et.';

      return void message.reply(
`🛒 **MARKET**
${singleRule}

__Normal Rolleri__
${normalLines}

__Premium Rolleri__
${premiumLines}
${premiumNote}

__Eşyalar / Güçlendirmeler__
${itemsBlock}

**Satın Alma / Kullanım**
• Rol almak: \`!market al <rolId>\`
• Rol iade: \`!market iade <rolId>\`
• Şans Kutusu: \`!şanskutusu\`
• Yüzük: \`!yüzük al\`
• XPBoost: \`!xpboost\`

**Diğer**
• Bakiye: \`!coin\`
• Coin transfer: \`!coin gonder @kisi <miktar>\`
• (Owner) Coin verme: \`!coin-ver @kisi <miktar>\`
`
      );
    }

    // ----------------- !rollerimarket (yalnızca rol listesi) -----------------
    if (txt === '!rollerimarket' || txt === '!market roller' || txt === '!market-roller') {
      if (!message.guild) return;

      const normalRefund = Math.floor(ROLE_PRICE / 2);
      const normalLines = MARKET_ROLE_IDS.length
        ? MARKET_ROLE_IDS.map((rid, i) =>
            `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${ROLE_PRICE} coin** (iade: **${normalRefund}**)`
          ).join('\n')
        : '_(Normal market boş)_';

      const premiumLines = PREMIUM_ROLE_IDS.length
        ? PREMIUM_ROLE_IDS.map((rid, i) =>
            `**P${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${PREMIUM_ROLE_PRICE} coin** (iade: **${getRefundById(rid)}**, “ikinci el olmuş”)`
          ).join('\n')
        : '_(Premium market boş)_';

      return void message.reply(
        `🧩 **Market Rolleri**\n${normalLines}\n\n${premiumLines}\n\n` +
        `Satın almak: \`!market al <rolId>\`\n` +
        `İade: \`!market iade <rolId>\``
      );
    }

    // ----------------- !coin (bakiye) -----------------
    if (txt === '!coin') {
      if (!gid) return;
      const bal = getPoints(gid, uid);
      return void message.reply(`💰 Coin bakiyen: **${bal}**`);
    }

    // ----------------- !market al / iade (rol) -----------------
    if (txt.startsWith('!market ')) {
      if (!gid || !message.guild) return;
      const parts = message.content.trim().split(/\s+/);
      const sub = (parts[1] || '').toLocaleLowerCase('tr');
      const roleId = (parts[2] || '').replace(/[^\d]/g, '');

      const ALL = [...MARKET_ROLE_IDS, ...PREMIUM_ROLE_IDS];

      if (!['al', 'iade'].includes(sub)) {
        return void message.reply('Kullanım:\n• `!market al <rolId>`\n• `!market iade <rolId>`\n• `!rollerimarket`');
      }
      if (!roleId) return void message.reply('⛔ Rol ID girmen lazım. `!rollerimarket` ile bakabilirsin.');
      if (!ALL.includes(roleId)) {
        return void message.reply('⛔ Bu rol markette değil. `!rollerimarket` ile geçerli rolleri gör.');
      }

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return void message.reply('⛔ Bu rol sunucuda bulunamadı (silinmiş olabilir).');

      const me = message.guild.members.me;
      if (!me?.permissions.has?.(PermissionFlagsBits.ManageRoles)) {
        return void message.reply('⛔ Gerekli yetki yok: **Rolleri Yönet**');
      }
      if (!(role.position < me.roles.highest.position)) {
        return void message.reply('⛔ Bu rolü yönetemiyorum (rol hiyerarşisi).');
      }

      const member = message.member;
      const hasRole = member.roles.cache.has(roleId);

      // Satın alma
      if (sub === 'al') {
        if (hasRole) return void message.reply('ℹ️ Bu role zaten sahipsin.');

        // Aynı anda sadece 1 market rolü kuralı
        const ownedMarketRoleId = getOwnedMarketRoleId(member);
        if (ownedMarketRoleId) {
          return void message.reply(
            `⛔ Zaten bir market rolüne sahipsin: <@&${ownedMarketRoleId}>.\n` +
            `İkinciyi alamazsın. Önce iade et: \`!market iade ${ownedMarketRoleId}\``
          );
        }

        const price = getRolePriceById(roleId);
        const bal = getPoints(gid, uid);
        if (bal < price) {
          return void message.reply(`⛔ Yetersiz coin. Gerekli: **${price}**, Bakiye: **${bal}**`);
        }
        try {
          await member.roles.add(roleId, 'Market satın alma');
          setPoints(gid, uid, bal - price);
          return void message.reply(
            `✅ <@&${roleId}> rolünü aldın! **-${price}** coin. Yeni bakiye: **${getPoints(gid, uid)}**`
          );
        } catch (e) {
          console.error('market al hata:', e);
          return void message.reply('⛔ Rol verilirken hata oluştu (izin/hiyerarşi).');
        }
      }

      // İade
      if (sub === 'iade') {
        if (!hasRole) return void message.reply('ℹ️ Bu role sahip değilsin, iade edilemez.');
        const refund = getRefundById(roleId);
        try {
          await member.roles.remove(roleId, 'Market iade');
          setPoints(gid, uid, getPoints(gid, uid) + refund);

          const premiumNote = isPremium(roleId) ? ' _(bu mallar **ikinci el olmuş**)_ ' : ' ';
          return void message.reply(
            `↩️ <@&${roleId}> iade edildi.${premiumNote}**+${refund}** coin geri yüklendi. ` +
            `Yeni bakiye: **${getPoints(gid, uid)}**`
          );
        } catch (e) {
          console.error('market iade hata:', e);
          return void message.reply('⛔ Rol geri alınırken hata oluştu (izin/hiyerarşi).');
        }
      }
    }

    // ----------------- !coin gonder @kisi N -----------------
    if (txt.startsWith('!coin gonder') || txt.startsWith('!coin gönder')) {
      if (!gid) return;
      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);
      if (!target || isNaN(amt)) return void message.reply('Kullanım: `!coin gonder @hedef <miktar>`');
      if (target.id === uid) return void message.reply('⛔ Kendine coin gönderemezsin.');
      if (amt <= 0) return void message.reply('⛔ Miktar **pozitif** olmalı.');
      const fromBal = getPoints(gid, uid);
      if (fromBal < amt) {
        return void message.reply(`⛔ Yetersiz bakiye. Bakiye: **${fromBal}**, göndermek istediğin: **${amt}**`);
      }
      setPoints(gid, uid, fromBal - amt);
      setPoints(gid, target.id, getPoints(gid, target.id) + amt);
      return void message.reply(`✅ <@${target.id}> kullanıcısına **${amt}** coin gönderdin. Yeni bakiyen: **${getPoints(gid, uid)}**`);
    }

    // ----------------- !coin-ver (Owner) -----------------
    if (txt.startsWith('!coin-ver')) {
      if (!gid) return;
      if (!__MARKET__FALLBACK_OWNERS.includes(uid)) {
        return void message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
      }
      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);
      if (!target || isNaN(amt) || amt <= 0) return void message.reply('Kullanım: `!coin-ver @hedef <pozitif_miktar>`');
      setPoints(gid, target.id, getPoints(gid, target.id) + amt);
      const label = __MARKET__LABEL[uid] || 'Owner';
      return void message.reply(
        `👑 ${label} — <@${target.id}> kullanıcısına **${amt}** coin verildi. ` +
        `Alıcının yeni bakiyesi: **${getPoints(gid, target.id)}**`
      );
    }

  } catch (err) { console.error('[MARKET BLOK HATASI]', err); }
});
/* ==================== / MARKET BLOK BİTTİ ==================== */



/* =======================================================================
   >>>>>>>>>>>>  EVLİLİK SİSTEMİ • TEK PARÇA BLOK — REVİZE  <<<<<<<<<<
   Komutlar:
   • !yüzük al            → 150 coin (tek kullanımlık yüzük satın al)
   • !yüzüğüm             → yüzüğün var mı bak
   • !evlen @kullanıcı    → butonlu evlilik teklifi (Kabul/Ret + GIF)
   • !eşim                → eşini göster
   • !boşan eşim          → boşan (50 coin ücret) + 80 coin nafaka eşe ödenir
   • !evlilikler          → aktif evlilikleri listele (ilk 10)

   EVLİLİLERE ÖZEL OYUN:
   • !çiftyazıtura yazı|tura  → sadece evliler oynayabilir, gün/kişi limiti: 10
      Kazan: +5 coin, Kaybet: -3 coin
======================================================================= */

// === Ayarlar (isteğine göre güncellendi)
const RING_PRICE         = 150;            // yüzük fiyatı (tek kullanımlık)
const DIVORCE_FEE        = 50;             // boşanma ücreti (boşanmayı başlatandan düşülür)
const ALIMONY_AMOUNT     = 80;            // nafaka (başlatandan eşine transfer)
const PROPOSAL_TIMEOUT   = 30_000;         // teklif geçerlilik süresi (ms)
const MARRIAGE_CD_MS     = 5 * 60 * 1000;  // teklif cooldown (ms)

const COUPLE_COIN_WIN    = 5;              // çiftyazıtura kazan ödülü
const COUPLE_COIN_LOSS   = -3;             // çiftyazıtura kayıp cezası
const COUPLE_DAILY_LIMIT = 10;             // kişi başı günlük oyun limiti

// === GIF'ler (teklif için mutlu; reddedilince hüzünlü)
const PROPOSAL_HAPPY_GIFS = [
  'https://media.tenor.com/3zRz0Vt2sHIAAAAM/ring-propose.gif',
  'https://media.tenor.com/WYQv8r2m5LgAAAAM/marriage-proposal-propose.gif',
  'https://media.tenor.com/3qY9hQw9gAkAAAAM/marry-me-proposal.gif',
];
const PROPOSAL_SAD_GIFS = [
  'https://media.tenor.com/jjH1h1Q8fQoAAAAM/sad-anime.gif',
  'https://media.tenor.com/-cBz3s7f7GMAAAAM/sad-cry.gif',
  'https://media.tenor.com/7BqZyq7n0xAAAAAM/rejected.gif',
];

// === Kalıcı (process ömrü) haritalar
const marriages = (globalThis.__MARRIAGES__ ||= new Map());        // gid -> Map(uid -> spouseId)
const rings     = (globalThis.__RINGS__     ||= new Map());        // gid:uid -> boolean
const marriedAt = (globalThis.__MARRIED_AT__ ||= new Map());       // gid:pairKey(sorted) -> tarih
const cooldowns = (globalThis.__MARRY_COOLDOWN__ ||= new Map());   // gid:uid -> ts
const coupleDaily = (globalThis.__COUPLE_DAILY__ ||= new Map());   // gid:uid:YYYY-MM-DD -> count

// === Kısayol yardımcıları (kodunda zaten var olanları da kullanıyoruz)
const kPair = (a,b)=>[a,b].sort().join(':');
const kRing = (gid, uid)=>`${gid}:${uid}`;
function isMarried(gid, uid) {
  const g = marriages.get(gid);
  return !!(g && g.get(uid));
}
function spouseOf(gid, uid) {
  const g = marriages.get(gid);
  return g ? g.get(uid) || null : null;
}
function setMarried(gid, a, b) {
  let g = marriages.get(gid);
  if (!g) marriages.set(gid, g = new Map());
  g.set(a, b); g.set(b, a);
  marriedAt.set(`${gid}:${kPair(a,b)}`, new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }));
}
function clearMarriage(gid, a, b) {
  const g = marriages.get(gid);
  if (!g) return;
  g.delete(a); g.delete(b);
  marriedAt.delete(`${gid}:${kPair(a,b)}`);
}
function hasRing(gid, uid)      { return !!rings.get(kRing(gid, uid)); }
function giveRing(gid, uid)     { rings.set(kRing(gid, uid), true); }
function consumeRing(gid, uid)  { rings.delete(kRing(gid, uid)); }

// Günlük sayaç (evlilere özel yazı/tura)
function coupleKeyDaily(gid, uid, day) { return `${gid}:${uid}:${day}`; }

// === Event
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const gid = message.guild?.id;
    if (!gid) return;
    const uid = message.author.id;
    const txt = (message.content || '').toLocaleLowerCase('tr').trim();

    // ---- YÜZÜK AL (tek kullanımlık)
    if (txt === '!yüzük al' || txt === '!yuzuk al' || txt === '!yüzükal' || txt === '!yuzukal') {
      if (isMarried(gid, uid))   return message.reply('Zaten evlisin babuş, yüzüğe gerek kalmadı 😅');
      if (hasRing(gid, uid))     return message.reply('Zaten bir yüzüğün var 💍 Teklif etmeyi dene: `!evlen @kişi`');

      const bal = getPoints(gid, uid);
      if (bal < RING_PRICE) {
        return message.reply(`⛔ Yetersiz coin. Gerekli: **${RING_PRICE}**, Bakiye: **${bal}**`);
      }
      setPoints(gid, uid, bal - RING_PRICE);
      giveRing(gid, uid);
      return message.reply(`✅ **-${RING_PRICE}** coin ile **tek kullanımlık** bir **yüzük** aldın! \`!evlen @kişi\``);
    }

    // ---- YÜZÜĞÜM
    if (txt === '!yüzüğüm' || txt === '!yuzugum' || txt === '!yüzüğum') {
      if (hasRing(gid, uid))     return message.reply('💍 Bir yüzüğün var. Şansını dene: `!evlen @kişi`');
      if (isMarried(gid, uid))   return message.reply('💍 Evlisin zaten; yüzüğün kalbinde ✨');
      return message.reply('💍 Henüz yüzüğün yok. Almak için: `!yüzük al`');
    }

    // ---- EVLEN (buton + GIF)
    if (txt.startsWith('!evlen')) {
      const target = message.mentions.users.first();
      if (!target)                  return message.reply('Kullanım: `!evlen @kullanıcı`');
      if (target.bot)               return message.reply('Botlarla evlenemem babuş 😅');
      if (target.id === uid)        return message.reply('Kendinle evlenemezsin… ama kendini sevmen güzel 😌');

      // cooldown
      const now = Date.now();
      const cdKey = `${gid}:${uid}`;
      const last = cooldowns.get(cdKey) || 0;
      if (now - last < MARRIAGE_CD_MS) {
        const left = Math.ceil((MARRIAGE_CD_MS - (now - last))/1000);
        return message.reply(`⏳ Biraz bekle babuş. Tekrar teklif için **${left} sn** kaldı.`);
      }

      // ring & durum
      if (!hasRing(gid, uid))       return message.reply(`💍 Önce yüzük al: \`!yüzük al\` (**${RING_PRICE} coin**)`);
      if (isMarried(gid, uid))      return message.reply('Zaten evlisin babuş.');
      if (isMarried(gid, target.id))return message.reply('Hedef kişi zaten evli görünüyor.');

      const happyGif = PROPOSAL_HAPPY_GIFS[Math.floor(Math.random()*PROPOSAL_HAPPY_GIFS.length)];
      const sadGif   = PROPOSAL_SAD_GIFS[Math.floor(Math.random()*PROPOSAL_SAD_GIFS.length)];

      // butonlu teklif
      const acceptId = `macc_${uid}_${target.id}_${Date.now()}`;
      const rejectId = `mrej_${uid}_${target.id}_${Date.now()}`;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(acceptId).setLabel('Kabul Et').setStyle(ButtonStyle.Success).setEmoji('💍'),
        new ButtonBuilder().setCustomId(rejectId).setLabel('Reddet').setStyle(ButtonStyle.Danger).setEmoji('❌'),
      );
      const m = await message.channel.send({
        content: `${target}, **${message.author.tag}** sana **evlilik teklifi** ediyor! 💞`,
        files: [happyGif],
        components: [row],
      });

      const collector = m.createMessageComponentCollector({
        time: PROPOSAL_TIMEOUT,
        filter: (i)=> (i.customId===acceptId || i.customId===rejectId) && i.user.id === target.id,
        componentType: ComponentType.Button,
      });

      let resolved = false;

      collector.on('collect', async (i) => {
        if (i.customId === rejectId) {
          resolved = true;
          cooldowns.set(cdKey, Date.now()); // reddedilince cooldown başlasın
          await i.update({ content: `💔 ${target} teklifi **reddetti**.`, files: [sadGif], components: [] });
        } else if (i.customId === acceptId) {
          // son saniye kontrolleri
          if (!hasRing(gid, uid)) {
            resolved = true;
            return i.update({ content: '⛔ Teklif geçersiz: yüzüğün yok oldu gibi…', components: [] });
          }
          if (isMarried(gid, uid) || isMarried(gid, target.id)) {
            resolved = true;
            return i.update({ content: '⛔ Teklif geçersiz: taraflardan biri artık evli görünüyor.', components: [] });
          }
          setMarried(gid, uid, target.id);
          consumeRing(gid, uid);
          cooldowns.set(cdKey, Date.now());
          resolved = true;
          await i.update({ content: `💍 **${message.author}** ve **${target}** artık **EVLİ!** 🎉`, components: [] });
        }
      });

      collector.on('end', async () => {
        if (!resolved) {
          cooldowns.set(cdKey, Date.now());
          await m.edit({ content: '⏰ Süre doldu, teklif **geçersiz** oldu.', components: [] }).catch(()=>{});
        }
      });

      return;
    }

    // ---- EŞİM
    if (txt === '!eşim' || txt === '!esim') {
      if (!isMarried(gid, uid)) return message.reply('Bekârsın babuş. Belki bugün değişir? `!evlen @kişi`');
      const sp = spouseOf(gid, uid);
      const since = marriedAt.get(`${gid}:${kPair(uid, sp)}`) || 'bilinmiyor';
      return message.reply(`💞 Eşin: <@${sp}> \n📅 Evlilik tarihi: **${since}**`);
    }

    // ---- BOŞAN (50 coin + 80 nafaka)
    if (txt === '!boşan eşim' || txt === '!bosan esim' || txt === '!boşan eşim' || txt === '!bosan eşim') {
      if (!isMarried(gid, uid)) return message.reply('Zaten bekârsın babuş.');
      const sp = spouseOf(gid, uid);

      // yeterli bakiye kontrolü (ücret + nafaka)
      const bal = getPoints(gid, uid);
      const totalCost = DIVORCE_FEE + ALIMONY_AMOUNT;
      if (bal < totalCost) {
        return message.reply(`⛔ Yetersiz coin. Boşanma için **${DIVORCE_FEE}** ücret + **${ALIMONY_AMOUNT}** nafaka gerekir (toplam **${totalCost}**). Bakiye: **${bal}**`);
      }

      // kesintiler & transfer
      setPoints(gid, uid, bal - DIVORCE_FEE);                       // ücreti kes
      setPoints(gid, uid, getPoints(gid, uid) - ALIMONY_AMOUNT);    // nafakayı düş
      setPoints(gid, sp, getPoints(gid, sp) + ALIMONY_AMOUNT);      // eşe nafaka ver

      clearMarriage(gid, uid, sp);
      return message.reply(`📄 **Boşanma tamam.** **-${DIVORCE_FEE}** coin ücret kesildi ve <@${sp}> kullanıcısına **${ALIMONY_AMOUNT}** coin **nafaka** ödendi. Yolunuz açık olsun 💔`);
    }

    // ---- EVLİLİKLER
    if (txt === '!evlilikler') {
      const g = marriages.get(gid);
      if (!g || g.size === 0) return message.reply('Bu sunucuda aktif evlilik yok gibi görünüyor.');
      const seen = new Set();
      const couples = [];
      for (const [a, b] of g.entries()) {
        const key = kPair(a, b);
        if (seen.has(key)) continue;
        seen.add(key);
        couples.push({ a, b, since: marriedAt.get(`${gid}:${key}`) || '' });
      }
      const list = couples.slice(0, 10).map((c, i)=>
        `**${i+1}.** <@${c.a}> ❤️ <@${c.b}>  ${c.since ? `(since: ${c.since})` : ''}`
      ).join('\n');
      return message.reply(`👩‍❤️‍👨 **Evlilik Listesi**\n${list}`);
    }

    // ---- EVLİLİLERE ÖZEL YAZI/TURA
    if (txt.startsWith('!çiftyazıtura') || txt.startsWith('!ciftyazitura') || txt.startsWith('!çiftyazi-tura') || txt.startsWith('!ciftyazi-tura')) {
      const parts = txt.split(/\s+/);
      const secim = (parts[1] || '').replace('yazi','yazı'); // yazi->yazı toleransı
      if (!['yazı', 'tura'].includes(secim)) {
        return message.reply('Kullanım: `!çiftyazıtura yazı` veya `!çiftyazıtura tura`');
      }
      if (!isMarried(gid, uid)) {
        return message.reply('⛔ Bu oyun **sadece evliler** için. `!evlen @kişi` ile başlayabilirsin.');
      }

      const day = todayTR();
      const dKey = coupleKeyDaily(gid, uid, day);
      const used = coupleDaily.get(dKey) || 0;
      if (used >= COUPLE_DAILY_LIMIT) {
        return message.reply(`⛔ Günlük oyun limitine ulaştın (**${COUPLE_DAILY_LIMIT}**). Yarın yine gel babuş!`);
      }

      const sonuc = Math.random() < 0.5 ? 'yazı' : 'tura';
      const kazandi = (secim === sonuc);
      const delta = kazandi ? COUPLE_COIN_WIN : COUPLE_COIN_LOSS;

      coupleDaily.set(dKey, used + 1);
      const total = addPoints(gid, uid, delta);

      return message.reply(
        `🪙 Çift Yazı/Tura: **${sonuc.toUpperCase()}** ` +
        (kazandi ? `→ Kazandın! **+${COUPLE_COIN_WIN}** coin` : `→ Kaybettin… **${COUPLE_COIN_LOSS}** coin`) +
        `\n📦 Toplam oyun coin’in: **${total}**  • Günlük: **${used+1}/${COUPLE_DAILY_LIMIT}**`
      );
    }

  } catch (err) {
    console.error('[EVLİLİK BLOK HATASI]', err);
  }
});
/* ==================== / EVLİLİK BLOK BİTTİ ==================== */


// ====================== YAZI OYUNU ======================
const activeTypingGames = new Map(); // cid -> { sentence, startedAt, timeoutId }
const TYPING_CHANNEL_ID = '1433137197543854110'; // sadece bu kanalda
const TYPING_SENTENCES = [
  'Gölgelerin arasından doğan ışığa asla sırtını dönme.',
  'Bugün, dünün pişmanlıklarını değil yarının umutlarını büyüt.',
  'Kahveni al, hedeflerini yaz ve başla.',
  'Rüzgârın yönünü değiştiremezsin ama yelkenini ayarlayabilirsin.',
  'Sabır, sessizliğin en yüksek sesidir.',
  'Küçük adımlar büyük kapıları açar.',
  'Düşmeden koşmayı kimse öğrenemez.',
  'Bir plan, rastgeleliğin panzehiridir.',
  'Zaman, hak edeni ortaya çıkarır.',
  'Hayal kurmak başlangıçtır; emek bitiriştir.',
  'Başlamak için mükemmel olman gerekmez, ama mükemmel olmak için başlaman gerekir.',
  'Düşlediğin şey için çalışmaya başla, çünkü kimse senin yerine yapmayacak.',
  'Her başarısızlık bir sonraki denemeye hazırlıktır.',
  'Kendine inan, çünkü en büyük güç orada gizlidir.',
  'İmkansız sadece biraz daha zamana ihtiyaç duyan şeydir.',
  'Cesaret, korkuya rağmen devam edebilmektir.',
  'Bir hedefin yoksa, hiçbir rüzgar işine yaramaz.',
  'Mutluluk, küçük şeyleri fark ettiğinde başlar.',
  'Karanlık olmadan yıldızları göremezsin.',
  'Büyük düşün, küçük adımlarla ilerle.',
  'Zaman seni değil, sen zamanı yönet.',
  'Bugün atılan adım, yarının başarısıdır.',
  'Azim, başarının en sessiz anahtarıdır.',
  'Hayat bir oyun değil, ama bazen oynamayı öğrenmelisin.',
  'Denemekten korkan, kaybetmeyi çoktan seçmiştir.',
  'Bir gün değil, her gün çalış.',
  'Düşün, planla, uygula, başla.',
  'Motivasyon biter ama disiplin kalır.',
  'Her yeni gün, bir fırsattır.',
  'Kendin ol, çünkü herkes zaten alınmış.',
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
  'https://media.tenor.com/aOQrkAJckyEAAAAM/cuddle-anime.gif',
  'https://media.tenor.com/i2Mwr7Xk__YAAAAM/cat-girl-snuggle.gif',
];
const HUG_MESSAGES = [
  'seni çok seviyor galiba 💞','bu sarılma bütün dertleri unutturdu 🫶','o kadar içten sarıldı ki oda 2 derece ısındı ☀️',
  'biraz fazla sıktı galiba ama tatlı duruyor 😳','mutluluğun resmi bu olabilir 💗','kim demiş soğuk insanlar sarılmaz diye 😌',
  'kalpler buluştu, dünya bir anlığına durdu 💫','sıcacık bir dostluk kokusu var bu sarılmada 🤍','böyle sarılınca kim üzülür ki? 🌈','en güçlü büyü: bir sarılma 🤗',
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
  if (txt.includes('eyw iyiyim') || txt.includes('eyvallah iyiyim'))
    return void message.reply('süper hep iyi ol ⭐');
}

/* ====================== ZAR OYUNU KURALLARI ======================
  - Kazanırsa: +3 coin
  - Kaybederse: -1 coin
  - 2 kez üst üste kaybederse: ek -3 ceza (o elde toplam -4) ve "Cooked" özel mesaj + gif
  - Coin’ler tek kasada: gamePoints
  - !zar coin -> birleşik kasadan gösterir
*/
const diceLossStreak = new Map(); // gid:uid -> ardışık kayıp sayısı
const DICE_GIFS = [
  'https://media.tenor.com/9UeW5Qm4rREAAAAM/dice-roll.gif',
  'https://media.tenor.com/vyPpM1mR9WgAAAAM/rolling-dice.gif',
  'https://media.tenor.com/1Qm6kQxRMgAAAAAM/dices.gif',
];
const COOKED_GIFS = [
  'https://media.tenor.com/L7bG8GkZZxQAAAAM/gordon-ramsay-cooked.gif',
  'https://media.tenor.com/8y0K0b2v8b0AAAAM/burn-fire.gif',
  'https://media.tenor.com/3j2sQwEw1yAAAAAM/you-are-cooked.gif',
];

/* ====================== "ÇAL" MİNİ OYUNU — AYARLAR ====================== */
const STEAL_ALLOWED_CHANNELS = new Set(['1268595926226829404','1433137197543854110']);
const STEAL_LOG_CHANNEL = '1268595919050244188';
const STEAL_AMOUNT = 2;
const STEAL_TIMEOUT = 30_000; // 30 sn
const STEAL_CLEANUP_THRESHOLD = 50;
const CLEAN_FETCH_LIMIT = 100;


// Saat aralığı (İstanbul 13:00–3:59)
function isWithinIstanbulWindow() {
  // İstanbul saati: (UTC +3)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcOffset = 3; // Türkiye UTC+3
  const h = (utcHours + utcOffset) % 24;

  // Test için log (isteğe bağlı)
  console.log("İstanbul saati:", h);

  // 13:00 (öğlen 1) - 03:59 (gece 4'e kadar) aktif
  return (h >= 13 || h < 3);
}


let stealUseCounter = 0;
const activeSteals = new Set(); // `${thiefId}:${victimId}`

// ====================== MESAJ OLAYI ============================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);
  const lc = message.content.toLocaleLowerCase('tr').trim();

  /* =============== BUTONLU "ÇAL" MİNİ OYUNU (ENTEGRE) =============== */
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
    if (!victim) return message.reply('Kullanım: `!çal @kullanıcı`');
    if (victim.bot) return message.reply('Botlardan çalamazsın 😅');
    if (victim.id === thief.id) return message.reply('Kendinden çalamazsın 🙂');

    const key = `${thief.id}:${victim.id}`;
    if (activeSteals.has(key)) return message.reply('Bu kullanıcıyla zaten aktif bir çalma denemen var, 30 saniye bekle.');

    const victimBal = getPoints(gid, victim.id);
    if (victimBal < STEAL_AMOUNT) return message.reply('Hedefin coin’i yetersiz.');

    activeSteals.add(key);

    const cancelId = `cancel_${Date.now()}_${thief.id}_${victim.id}`;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(cancelId)
        .setLabel('İptal Et (30s)')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⛔')
    );

    const gameMsg = await message.channel.send({
      content: `${victim}, **${thief.tag}** senden **${STEAL_AMOUNT} coin** çalmaya çalışıyor! 30 saniye içinde butona basmazsan para gider 😈`,
      components: [row],
    });

    let prevented = false;

    const collector = gameMsg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: STEAL_TIMEOUT,
      filter: (i) => i.customId === cancelId && i.user.id === victim.id,
    });

    collector.on('collect', async (i) => {
      prevented = true;
      activeSteals.delete(key);
      await i.update({
        content: `🛡️ ${victim} çalmayı **iptal etti**! ${thief} eli boş döndü.`,
        components: [],
      });
    });

    collector.on('end', async () => {
      if (prevented) return;
      activeSteals.delete(key);

      const vBal2 = getPoints(gid, victim.id);
      if (vBal2 < STEAL_AMOUNT) {
        return gameMsg.edit({
          content: `⚠️ ${victim} zaten fakirleşmiş, çalacak bir şey kalmadı.`,
          components: [],
        });
      }

      // Transfer
      setPoints(gid, victim.id, vBal2 - STEAL_AMOUNT);
      setPoints(gid, thief.id, getPoints(gid, thief.id) + STEAL_AMOUNT);

      await gameMsg.edit({
        content: `💰 **${thief}**, **${victim}**'den **${STEAL_AMOUNT} coin** çaldı!`,
        components: [],
      });

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
        if (logCh?.isTextBased?.()) {
          await logCh.send('🧹 **50 kullanım doldu! Çal komutu mesajları temizlendi.**');
        }
      }
    });

    return; // çal komutu işlendi, aşağıya düşmesin
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
    const text =
      ['evet 😌 sor bakalım babuş 💭'].concat(
        randomQuestions.map((q, i) => `**${i + 1}.** ${q}`)
      ).join('\n');
    return message.reply(text);
  }

  // ======= OWO FİLTRE =======
  const isWDaily = lc.startsWith('w daily');
  const isWCf = lc.startsWith('w cf');
  if (isWDaily || isWCf) {
    if (!ALLOWED_GAME_CHANNELS.has(cid)) {
      await message.reply(
        `⛔ Bu kanalda onu oynayamazsın kardeş. Şu kanala gel: <#${REDIRECT_CHANNEL_ID}>`
      ).catch(() => {});
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
        `⌨️ **Yazı Oyunu** başlıyor! Aşağıdaki cümleyi **ilk ve doğru** yazan kazanır (noktalama önemsiz).
> ${sentence}
⏱️ Süre: **60 saniye**\n📌 **Günlük limit:** Aynı üye max **4 kez** coin alabilir.`
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
          addPoints(gid, uid, 3);
          return void message.channel.send(
            `🏆 **${message.author}** doğru yazdı ve **+3 coin** kazandı! (Günlük yazı ödülün: **${current + 1}/4**) \n> _${game.sentence}_`
          );
        }
      }
    }
  }
  // =================== /YAZI OYUNU ===================

  // ===================== SARILMA OYUNU =====================
  if (txt.startsWith('!sarıl') || txt.startsWith('!saril')) {
    if (cid !== HUG_CHANNEL_ID)
      return message.reply(`⛔ Bu komut sadece <#${HUG_CHANNEL_ID}> kanalında kullanılabilir.`);
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Kime sarılmak istiyorsun babuş? !sarıl @kullanıcı şeklinde kullan.');
    }
    const msg = HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)];
    const gif = HUG_GIFS[Math.floor(Math.random() * HUG_GIFS.length)];
    if (target.id === uid) {
      return message.reply({
        content: `**${message.author.username}**, kendine sarıldı… kendi kendini teselli etmek de bir sanattır 🤍`,
        files: [gif],
      });
    }
    return message.reply({
      content: `**${message.author.username}**, **${target.username}**'e sarıldı! ${msg}`,
      files: [gif],
    });
  }
  // =================== /SARILMA OYUNU ===================

  // Sohbet liderliği sayacı (sadece belirlenen kanal)
  if (gid && cid === SOHBET_KANAL_ID) {
    const k = mKey(gid, cid, uid);
    messageCount.set(k, (messageCount.get(k) || 0) + 1);
  }

  // ----------- ÜYE YARDIM (her yerde)  — (GÜNCELLENDİ) -----------
  if (txt === '!yardım' || txt === '!yardim') {
    const helpText = `📘 **Fang Yuan Bot • Üye Yardım**

🎮 **Oyunlar (Tek Kasa)**
• \\!yazıoyunu — **<#${TYPING_CHANNEL_ID}>** kanalında 60 sn'lik yazı yarışını başlatır.  
  ↳ **Günlük limit:** aynı üye max **4** kez coin alır.  
• \\!yazı bonus — Günlük **+15** yazı bonusu (İstanbul gününe göre).  
• \\!zar üst / \\!zar alt — 1–3 alt, 4–6 üst. Kazan: **+3**, Kaybet: **-1**.  
  ↳ 2x üst üste kayıp: ek **-3** (o elde toplam **-4**, “Cooked” uyarısı).  
• \\!zar bonus — Günlük **+15** zar bonusu.  
• \\!sıralama — Zar + Yazı **birleşik coin sıralaması**.  
• \\!zar coin / \\!yazıcoin — Aynı birleşik kasadan ilk 10’u gösterir.

💞 **Etkileşim**
• \\!sarıl @kullanıcı — **<#${HUG_CHANNEL_ID}>** kanalında sarılma GIF’i ile sarılır.
• \\@Fang Yuan Bot — “naber babuş”, “günaydın”, “moralim bozuk”, “çok mutluyum” vb.
• **LoL**: “**mainim <şampiyon>**” yaz; şampiyona özel cevap.
• **Çiçek**: “**en sevdiğim çiçek <isim>**” yaz; şık yanıt.

🎲 **Eğlence**
• \\!espiri — Rastgele espri + bilgi.
• \\!yazıtura — Yazı/Tura at.

📊 **İstatistik**
• \\!ses — En çok seste kalanlar.
• \\!sesme — Toplam seste kalma süren.
• \\!sohbet — **<#${SOHBET_KANAL_ID}>** için mesaj liderliği.

🕹️ **OwO Kısıtı**
• OwO komutları (ör. \\w daily, \\w cf <sayı>) sadece: <#1369332479462342666>, <#${REDIRECT_CHANNEL_ID}>.
• Diğer kanallarda otomatik uyarı ve (iznin varsa) mesaj silme çalışır.

🛒 **Market**
• \\!yardımmarket — Market kullanımını ve satılık rolleri gösterir.
• \\!market— Satıştaki rol listesi ve fiyatlar.
• \\!market al <rolId> — Rol satın al (**${ROLE_PRICE} coin**).
• \\!market iade <rolId> — İade (**${Math.floor(ROLE_PRICE/2)} coin** geri).
• \\!coin — Coin bakiyen.
• \\!coin gonder @kisi <miktar> — Coin transferi.
• (Owner) \\!coin-ver @kisi <miktar> — Sınırsız coin verme.
• **Evlilik**: **Yüzük** (tek kullanımlık) — **150 coin** → "!yüzük al"


ℹ️ **Notlar**
• Zar + Yazı coin’leri **tek kasada** toplanır; market ile birlikte kullanılır.
• Bonuslar **günde 1 kez** alınır (İstanbul saatine göre).
• Owner/Yetkili komutları için \\!yardımyetkili yaz.`;
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

  // ---------- OYUN BONUSLARI (GÜNDE 1) ----------
  if (txt === '!yazı bonus' || txt === '!yazi bonus' || txt === '!yazıbonus' || txt === '!yazi-bonus') {
    if (!gid) return;
    const day = todayTR();
    const k = kDaily(gid, uid, day);
    if (dailyClaimYaziBonus.get(k)) {
      return message.reply('⛔ Bugünün **Yazı bonusunu** zaten aldın. Yarın tekrar gel babuş!');
    }
    dailyClaimYaziBonus.set(k, true);
    const total = addPoints(gid, uid, 15);
    return message.reply(`✅ **+15** Yazı bonusu eklendi! Toplam oyun coin’in: **${total}**`);
  }
  if (txt === '!zar bonus' || txt === '!zarbonus' || txt === '!zar-bonus') {
    if (!gid) return;
    const day = todayTR();
    const k = kDaily(gid, uid, day);
    if (dailyClaimZarBonus.get(k)) {
      return message.reply('⛔ Bugünün **Zar bonusunu** zaten aldın. Yarın yine şansını dene!');
    }
    dailyClaimZarBonus.set(k, true);
    const total = addPoints(gid, uid, 15);
    return message.reply(`✅ **+15** Zar bonusu eklendi! Toplam oyun coin’in: **${total}**`);
  }

  // ---------- OYUN SIRALAMASI ----------
  if (
    txt === '!sıralama' || txt === '!siralama' ||
    txt === '!rank' || txt === '!top' ||
    txt === '!oyunsıralama' || txt === '!oyunsiralama'
  ) {
    if (!gid) return;
    const top = guildTop(gid, 10);
    if (!top.length) return message.reply('🏁 Henüz oyun coin’i yok.');
    const table = top.map((r, i) => `**${i + 1}.** <@${r.uid}> — **${r.pts}** coin`).join('\n');
    return message.reply(`🎯 **Sunucu Oyun Sıralaması**\n${table}`);
  }
  // ---------- /OYUN SIRALAMASI ----------

// ---------- GÜNLÜK GÖREV SİSTEMİ (ENTEGRE) ----------
if (txt === '!görev' || txt === '!gorev' || txt === '!gunlukgorev') {
  const GOREV_COUNT_CHANNEL  = '1413929200817148104';
  const GOREV_COMMAND_CHANNEL = '1433137197543854110';
  const GOREV_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 saat
  const DAILY_TIERS = [
    { need: 200, reward: 20, key: 't200', label: '200 mesaj → +20 coin' },
    { need: 100, reward: 10, key: 't100', label: '100 mesaj → +10 coin' },
    { need:  10, reward:  1, key: 't10',  label: '10 mesaj → +1 coin'  },
  ];

  // Depolar
  const dailyMsgCounter = (globalThis.__DAILY_MSG__   ||= new Map());
  const dailyClaimFlags = (globalThis.__DAILY_FLAGS__ ||= new Map());
  const gorevCooldown   = (globalThis.__GOREV_CD__    ||= new Map());

  function gorevKeyDaily(gid, uid, day) { return `${gid}:${uid}:${day}`; }
  function gorevGetFlags(gid, uid, day) {
    const k = gorevKeyDaily(gid, uid, day);
    let obj = dailyClaimFlags.get(k);
    if (!obj) { obj = { t10:false, t100:false, t200:false }; dailyClaimFlags.set(k, obj); }
    return obj;
  }
  function gorevFmtCooldown(msLeft) {
    const m = Math.ceil(msLeft / 60000);
    const h = Math.floor(m / 60), mm = m % 60;
    return h > 0 ? `${h}sa ${mm}dk` : `${mm}dk`;
  }

  if (message.channel?.id !== GOREV_COMMAND_CHANNEL)
    return message.reply(`⛔ Bu komutu sadece <#${GOREV_COMMAND_CHANNEL}> kanalında kullanabilirsin.`);

  const gid = message.guild?.id; if (!gid) return;
  const uid = message.author.id;
  const day = todayTR();
  const k = gorevKeyDaily(gid, uid, day);
  const count = dailyMsgCounter.get(k) || 0;
  const flags = gorevGetFlags(gid, uid, day);

  const cdKey = `${gid}:${uid}`;
  const now = Date.now();
  const cdUntil = gorevCooldown.get(cdKey) || 0;
  const onCooldown = now < cdUntil;
  const eligible = DAILY_TIERS.find(t => count >= t.need && !flags[t.key]);

  const progLines = [
    `📊 Bugünkü mesaj sayın (yalnızca <#${GOREV_COUNT_CHANNEL}>): **${count}**`,
    `🎯 Kademeler:`,
    `• 10 mesaj → +1 coin  ${flags.t10  ? '✅ alındı' : (count>=10  ? '🟢 hazır' : '⚪ bekliyor')}`,
    `• 100 mesaj → +10 coin ${flags.t100 ? '✅ alındı' : (count>=100 ? '🟢 hazır' : '⚪ bekliyor')}`,
    `• 200 mesaj → +20 coin ${flags.t200 ? '✅ alındı' : (count>=200 ? '🟢 hazır' : '⚪ bekliyor')}`,
  ].join('\n');

  if (onCooldown) {
    const left = cdUntil - now;
    return message.reply(`${progLines}\n\n⏳ Bir sonraki ödül için bekleme: **${gorevFmtCooldown(left)}**`);
  }

  if (!eligible) {
    return message.reply(`${progLines}\n\nℹ️ Uygun yeni ödül yok ya da bugünkü kademeleri bitirdin.`);
  }

 // XPBoost alanlara 1.5x çarpan uygula
const XP_PERM = (globalThis.__XP_PERM__ ||= new Set());
const hasBoost = XP_PERM.has(`${gid}:${uid}`);
const finalReward = hasBoost ? Math.floor(eligible.reward * 1.5) : eligible.reward;

addPoints(gid, uid, finalReward);
flags[eligible.key] = true;
gorevCooldown.set(cdKey, now + GOREV_COOLDOWN_MS);


  return void message.reply(
  `✅ **Günlük görev ödülü verildi!** → **${eligible.label.split('→')[1].trim()}** ` +
  (hasBoost ? '(x1.5 🔥)' : '') + `\n` + // sadece XPBoost sahiplerinde görünür
  `📦 Toplam coin: **${(gamePoints.get(`${gid}:${uid}`) || 0)}**\n\n` +
  `${progLines}\n\n⏳ Bir sonraki ödül için bekleme: **${gorevFmtCooldown(GOREV_COOLDOWN_MS)}**`
);
}
// ---------- /GÜNLÜK GÖREV SİSTEMİ ----------

 // ---------- XPBOOST (KALICI 1.5x) ----------
if (txt === '!xpboost') {
  if (!gid) return;
  const uid = message.author.id;
  const key = `${gid}:${uid}`;
  const PRICE = 200;
  const bal = getPoints(gid, uid);

  // XP boost kaydı
  const XP_PERM = (globalThis.__XP_PERM__ ||= new Set());

  if (XP_PERM.has(key)) {
    return message.reply('⚡ Zaten kalıcı **XPBoost (1.5x)** sahibisin babuş!');
  }

  if (bal < PRICE) {
    return message.reply(`⛔ Yetersiz coin! Gerekli: **${PRICE}**, senin bakiyen: **${bal}**`);
  }

  setPoints(gid, uid, bal - PRICE);
  XP_PERM.add(key);

  return message.reply(
    `✅ **Kalıcı XPBoost (1.5x)** başarıyla satın alındı!\n` +
    `🔥 Artık **günlük görev ödüllerin 1.5x** kazandırıyor.\n` +
    `💰 Yeni bakiyen: **${getPoints(gid, uid)}**`
  );
}

  
  // ---------- ZAR (COIN’Lİ) ----------
  if (txt.startsWith('!zar')) {
    if (txt.trim() === '!zar coin' || txt.trim() === '!zarcoin') {
      if (!gid) return;
      const top = guildTop(gid, 10);
      if (!top.length) return message.reply('🏁 Henüz oyun coin’i yok.');
      const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.pts}** coin`).join('\n');
      return message.reply(`🎯 **Oyun Coin Sıralaması**\n${table}`);
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

    const key = kGame(gid, uid);
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
    const total = addPoints(gid, uid, delta);
    const baseText = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}** ${
      kazandi ? 'Kazandın 🎉 (**+3** coin)' : 'Kaybettin 😿 (**-1** coin)'
    }\n📦 Toplam oyun coin’in: **${total}**`;
    return void message.reply({ content: `${baseText}${extraNote}`, files: [gif] });
  }
  // ---------- /ZAR (COIN’Lİ) ----------

  
// ====================== ŞANS KUTUSU SİSTEMİ (Günlük 3 hak, %40 boş) ======================
if (message.content.toLowerCase().startsWith('!şanskutusu')) {
  const CHANCE_BOX_CHANNEL = '1433137197543854110'; // sadece bu kanalda
  if (message.channel.id !== CHANCE_BOX_CHANNEL) {
    return message.reply(`🎲 Bu komutu sadece <#${CHANCE_BOX_CHANNEL}> kanalında kullanabilirsin babuş.`);
  }

  // 🔐 Günlük limit sayaç haritası (dosyaya tek sefer tanımlanır; burada güvenle kullan)
  const dailyChanceBoxUses = (globalThis.__DAILY_CHANCE_BOX_USES__ ||= new Map());

  const userId = message.author.id;
  const guildId = message.guild.id;

  // İstanbul gününe göre ana kodda zaten var: todayTR(), kDaily()
  const MAX_DAILY_CHANCE_BOX = 5;
  const dayKey = kDaily(guildId, userId, todayTR());
  const used = dailyChanceBoxUses.get(dayKey) || 0;
  if (used >= MAX_DAILY_CHANCE_BOX) {
    return message.reply(`⛔ Bugün **${MAX_DAILY_CHANCE_BOX}** kez kullandın babuş. Yarın tekrar dene!`);
  }

  // Ücret ve bakiye
  const cost = 8;
  const balance = getPoints(guildId, userId);
  if (balance < cost) {
    return message.reply('Coinin yetmiyor babuş, **4 coin** lazım.');
  }

  // Giriş ücreti (kaybedince ek ceza yok)
  setPoints(guildId, userId, balance - cost);

  // 🎲 Olasılıklar: %40 boş | %35 küçük | %20 orta | %4.5 büyük | %0.5 jackpot
  const roll = Math.random() * 100;
  let reward = 0;
  let resultMsg = '';

  if (roll < 40) {
    // %40 boş
    resultMsg = '😔 Kutudan boş çıktı, şansına küs babuş.';
  } else if (roll < 75) {
    // %35 küçük
    reward = 10;
    resultMsg = `🪙 Küçük ödül! ${reward} coin kazandın.`;
  } else if (roll < 95) {
    // %20 orta (+%40 buff)
    reward = Math.round(20 * 1.4);
    resultMsg = `💰 Orta ödül! ${reward} coin kazandın!`;
  } else if (roll < 99.5) {
    // %4.5 büyük (+%40 buff)
    reward = Math.round(35 * 1.4);
    resultMsg = `💎 Büyük ödül! ${reward} coin senin babuş!`;
  } else {
    // %0.5 jackpot
    reward = 300;
    resultMsg = `🔥 JACKPOT! ${reward} coin kazandın!!`;
  }

  if (reward > 0) {
    setPoints(guildId, userId, getPoints(guildId, userId) + reward);
  }

  // Hakkı tüket
  dailyChanceBoxUses.set(dayKey, used + 1);

  return message.reply(`🎁 **Şans Kutusu:** ${resultMsg}\n📆 Bugünkü hakkın: **${used + 1}/${MAX_DAILY_CHANCE_BOX}**`);
}


  // ----------- YETKİLİ YARDIM -----------
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
• **!ban <kullanıcıId>** — (Owner) Kullanıcıyı yasaklar. Gerekli izin: **Üyeleri Yasakla**.
• **!unban <kullanıcıId>** — (Owner) Banı kaldırır. Gerekli izin: **Üyeleri Yasakla**.
• **!mute <kullanıcıId> <dakika>** — (Owner veya yetkili rol) Zaman aşımı. 1–43200 dk.
• **!sohbet-sil <1–100>** — (Owner) Kanaldaki mesajları toplu siler (14 günden eski hariç).

**Sayaç/İstatistik Sıfırlama**
• **!sohbet-sifirla** — (Owner) Sohbet liderliği sayaçlarını temizler.
• **!ses-sifirla** — (Owner) Ses istatistiklerini sıfırlar.

**Yazı Oyunu Yönetimi** *(sadece **<#${TYPING_CHANNEL_ID}>** kanalında)*
• **!yazıiptal** — (Owner) Aktif yarışmayı iptal eder.

**OwO İzinleri**
• **!owo-izin** — (Owner) OwO botu için kanal bazlı izinleri toplu uygular.
• **!owo-test** — Bulunduğun kanalda OwO komutlarına izin var mı gösterir.

> Owner ID’leri: ${OWNERS.join(', ')}`;
    return void message.reply(adminHelp);
  }

  // ====================== ÇİÇEK DİYALOĞU ======================
  // İSTEK 1: @bot en sevdiğin çiçek ne  → gül cevabı
  if (message.mentions.users.has(client.user.id) && /en sevdiğin çiçek ne/i.test(lc)) {
    return void message.reply('En sevdiğim çiçek güldür, anısı da var 😔 Seninki ne?');
  }
  // Eski varyant
  if (txt.includes('en sevdiğin çiçek ne baba')) {
    return void message.reply('En sevdiğim çiçek güldür, anısı da var 😔 Seninki ne?');
  }
  // İSTEK 2: “en sevdiğim çiçek güldür anısı var”
  if (/en sevdiğim çiçek güldür anısı var/i.test(lc)) {
    return void message.reply('Vay… o zaman aynı yerden yaralanmışız galiba 🌹 Neyse, gül güzel; dikenleri de hayatın parçası.');
  }

  if (/en sevdiğim çiçek/i.test(txt)) {
    const raw = message.content.replace(/<@!?\d+>/g, '').trim();
    const m = raw.match(/en sevdiğim çiçek\s+(.+)/i);
    const userSaid = (m && m[1] ? m[1] : '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?]+$/, '');
    const found = FLOWER_LIST.find((f) => tLower(userSaid).includes(tLower(f)));
    const replyText = FLOWER_RESPONSES[Math.floor(Math.random() * FLOWER_RESPONSES.length)];
    if (found) return void message.reply(replyText);
    else return void message.reply(`Ooo ${(userSaid || 'bu çiçeği')} mi diyorsun? 🌼 ${replyText}`);
  }
  // ==================== / ÇİÇEK DİYALOĞU ======================

  // ====================== LOL KARAKTER DİYALOĞU ======================
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
  // ==================== / LOL KARAKTER DİYALOĞU ======================

  // ----------- REPLY TABANLI OTOMATİK CEVAPLAR -----------
  await handleReplyReactions(message);

  // ----------- BOT MENTION + KİŞİSEL SOHBET -----------
  if (message.mentions.users.has(client.user.id)) {
    const found = PERSONAL_RESPONSES.find((item) => lc.includes(item.key));
    if (found) {
      if (PERSONAL_CHAT_CHANNELS.has(cid)) {
        const reply = pickOne(found.answers);
        return void message.reply(reply);
      } else {
        return void message.reply(PERSONAL_CHAT_REDIRECT);
      }
    }
    if (lc.includes('moralim bozuk')) {
      const reply = SAD_REPLIES[Math.floor(Math.random() * SAD_REPLIES.length)];
      return void message.reply(reply);
    }
    if (lc.includes('çok mutluyum') || lc.includes('cok mutluyum')) {
      const reply = HAPPY_REPLIES[Math.floor(Math.random() * HAPPY_REPLIES.length)];
      return void message.reply(reply);
    }
    // 👉 Gay / Lez
    if (/(gay ?m[iı]sin|gaym[iı]s[iı]n|lez ?m[iı]sin|lezbiyen ?m[iı]sin|lezm[iı]s[iı]n)/i.test(lc)) {
      return void message.reply({
        content: 'hmmmm… düşünmem lazım 😶‍🌫️ sanırım gayım… ne bileyim ben 🤔',
        files: [ORIENTATION_PHOTO_URL],
      });
    }
    if (lc.includes('teşekkürler sen')) return void message.reply('iyiyim teşekkürler babuş👻');
    if (lc.includes('teşekkürler')) return void message.reply('rica ederim babuş👻');
    if (lc.includes('yapıyorsun bu sporu')) return void message.reply('yerim seni kız💎💎');
    if (lc.includes('naber babuş')) return void message.reply('iyiyim sen babuş👻');
    if (lc.includes('eyw iyiyim') || lc.includes('eyvallah iyiyim'))
      return void message.reply('süper hep iyi ol ⭐');
    if (/(günaydın|gunaydin)/.test(lc))
      return void message.reply('Günaydın babuş ☀️ yüzünü yıkamayı unutma!');
    if (/(iyi akşamlar|iyi aksamlar)/.test(lc))
      return void message.reply('İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏');

    const onlyMention = message.content.replace(/<@!?\d+>/g, '').trim().length === 0;
    if (onlyMention) return void message.reply('naber babuş 👻');
  }

  // ----------- İSTATİSTİK KOMUTLARI -----------
  if (txt === '!ses') {
    if (!gid) return;
    const data = [];
    for (const [k, sec] of totals)
      if (k.startsWith(`${gid}:`)) data.push({ uid: k.split(':')[1], sec });
    if (!data.length) return message.reply('Ses kanalları bomboş... yankı bile yok 😴');
    data.sort((a, b) => b.sec - a.sec);
    const top = data
      .slice(0, 10)
      .map((r, i) => `**${i + 1}.** <@${r.uid}> — ${formatTime(r.sec)}`)
      .join('\n');
    return message.reply(`🎙️ **Ses Liderliği Paneli**\n${top}`);
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

  // ====================== OWNER KOMUTLARI ======================
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

  // OwO izin ayarları (stub)
  if (txt === '!owo-izin') return void handleOwoIzinCommand(message);
  if (txt === '!owo-test') return void handleOwoTest(message);

  // Ban
  if (txt.startsWith('!ban')) {
    if (!inCommandChannel(message)) return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    if (!OWNERS.includes(uid)) return message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
    const m = message.content.match(/^!ban\s+(\d{17,20})$/);
    if (!m) return message.reply('Kullanım: !ban <kullanıcıId>');
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

  // Unban
  if (txt.startsWith('!unban')) {
    if (!inCommandChannel(message)) return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    if (!OWNERS.includes(uid)) return message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
    const m = message.content.match(/^!unban\s+(\d{17,20})$/);
    if (!m) return message.reply('Kullanım: `!unban <kullanıcıId>`');
    const targetId = m[1];
    if (!message.guild) return;
    try {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('⛔ Gerekli yetki yok: **Üyeleri Yasakla**');
      }
      const banEntry = await message.guild.bans.fetch(targetId).catch(() => null);
      if (!banEntry) return message.reply('ℹ️ Bu kullanıcı şu anda banlı görünmüyor.');
      await message.guild.members.unban(targetId, `Owner unban: ${message.author.tag}`);
      return void message.reply(`✅ <@${targetId}> kullanıcısının banı kaldırıldı.`);
    } catch (e) {
      console.error('!unban hata:', e);
      return message.reply('⛔ Unban işlemi başarısız oldu (yetki/ID/hata).');
    }
  }

  // Mute
  if (txt.startsWith('!mute')) {
    if (!inCommandChannel(message)) return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    const invokerIsOwner = OWNERS.includes(uid);
    const invokerHasRole = hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES) || hasAnyRole(message.member, MUTE_ALLOWED_ROLES);
    if (!invokerIsOwner && !invokerHasRole) return message.reply('⛔ Bu komutu kullanamazsın (gerekli rol yok).');
    const m = message.content.match(/^!mute\s+(\d{17,20})\s+(\d{1,5})$/);
    if (!m) return message.reply('Kullanım: !mute <kullanıcıId> <dakika> (ör. !mute 123456789012345678 15)');
    const targetId = m[1];
    const minutes = Math.max(1, Math.min(43200, parseInt(m[2], 10))); // 1 dk - 30 gün
    const ms = minutes * 60 * 1000;
    if (!message.guild) return;
    try {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('⛺ Gerekli yetki yok: **Üyeleri Zaman Aşımına Uğrat**');
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

  // Owner → (!sohbet-sil <adet>)
  if (txt.startsWith('!sohbet-sil')) {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    const m = txt.match(/^!sohbet-sil\s+(\d{1,3})$/);
    if (!m) return message.reply('Kullanım: !sohbet-sil <adet> (1–100)');
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

    await new Promise((r) => setTimeout(r, 1500)); // audit gecikmesi

    let executor = null;
    try {
      const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === channel.id) executor = entry.executor || null;
    } catch (e) { console.error('Audit log okunamadı:', e); }

    let kickResult = 'Belirsiz';
    if (executor && !OWNERS.includes(executor.id)) {
      try {
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member && member.kickable) {
          await member.kick('Koruma: sohbet kanalını izinsiz silme.');
          kickResult = 'Kick atıldı ✅';
        } else kickResult = 'Kick atılamadı ⛔ (yetki / hiyerarşi / bulunamadı)';
      } catch (e) { kickResult = 'Kick denemesi hatası ⛔'; console.error('Kick hatası:', e); }
    } else if (executor && OWNERS.includes(executor.id)) kickResult = 'Owner sildi, işlem yok';
    else kickResult = 'Silen tespit edilemedi ⛔ (audit log gecikmesi / izin)';

    const info = `⚠️ **Kanal Koruma**
+ Silinen kanal: <#${SOHBET_KANAL_ID}> (${SOHBET_KANAL_ID})
+ Silen: ${executor ? (executor.tag || executor.id) : 'bilinmiyor'}
+ İşlem: ${kickResult}`;

    for (const id of OWNERS) {
      try { const u = await client.users.fetch(id); await u.send(info); } catch {}
    }
  } catch (err) { console.error('channelDelete koruma hatası:', err); }
});

// ====================== READY / HAZIR ==========================
client.once('ready', async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Fang Yuan | !yardım', type: ActivityType.Playing }],
    status: 'online',
  });

  // 🔔 ÜYE REHBERİ MESAJI — bot açıldığında otomatik gönder
  try {
    const channel = await client.channels.fetch(GUIDE_CHANNEL_ID).catch(() => null);
    if (channel) {
      const guide = `🐉 **Fang Yuan Bot • Üye Rehberi**

Selam dostum 👋 Ben **Fang Yuan Bot**!
Artık **tek kasalı** oyun sistemim var: Zar + Yazı coin’lerin **aynı yerde** toplanır.

🎮 **Kısayollar**
• !yazıoyunu — 60 sn yazı yarışması (**<#${TYPING_CHANNEL_ID}>**) | Günlük yazı ödülü limiti: **4**
• !yazı bonus / !zar bonus — Her biri **günde +15** (İstanbul gününe göre)
• !zar üst / !zar alt — Kazan: +3 | Kaybet: -1 | 2x kayıp = ek -3 (COOKED)
• !oyunsıralama — Birleşik coin sıralaması
• !yardım — Tüm komut listesi

İyi eğlenceler babuş 💫`;
      await channel.send(guide);
      console.log('📘 Üye rehberi mesajı gönderildi!');
    } else {
      console.warn('⚠️ Rehber gönderilecek kanal bulunamadı.');
    }
  } catch (e) { console.error('Rehber mesajı gönderilemedi:', e); }
});

// ====================== STUB KOMUTLAR ==========================
async function handleOwoIzinCommand(message) {
  try { return void message.reply('🛠️ (Örnek) OwO izin yapılandırması tamam simülasyonu ✅'); }
  catch { return void message.reply('⛔ OwO izin ayarında bir hata oluştu.'); }
}
async function handleOwoTest(message) {
  const allowed = ALLOWED_GAME_CHANNELS.has(message.channel?.id ?? '');
  return void message.reply(
    allowed
      ? '✅ Bu kanalda OwO komutlarına izin var.'
      : `⛔ Bu kanalda OwO komutuna izin yok. Lütfen <#${[...ALLOWED_GAME_CHANNELS][0]}> veya <#${[...ALLOWED_GAME_CHANNELS][1]}> kullan.`
  );
}

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
    client.user?.setPresence({
      activities: [{ name: 'Fang Yuan | !yardım', type: ActivityType.Playing }],
      status: 'online',
    });
  } catch {}
}, 14 * 60 * 1000);

// ====================== GENEL HATA YAKALAYICI ===================
process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));
