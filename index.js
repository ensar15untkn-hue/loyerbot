// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  AuditLogEvent,
  ActivityType,
  PermissionFlagsBits,
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

// Ana soru havuzu (örnek — senin 100 soruluk setten alınacak)
const QUESTION_POOL = [
  'Ne yapıyorsun?',
  'Canın sıkılıyor mu?',
  'Bugün nasılsın?',
  'Beni özledin mi?',
  'Hayalin ne?',
  'Uyudun mu?',
  'Aşık oldun mu?',
  'Kız mısın erkek misin?',
  'Mutluluk nedir?',
  'Dostluk nedir?',
  'Hayat zor mu?',
  'Beni tanıyor musun?',
  'Gerçek misin?',
  'Korkun var mı?',
  'Kahve mi çay mı?',
  'İnsan olsan ne olurdun?',
  'Kıskanır mısın?',
  'Neden bu kadar coolsun?',
  'Ne düşünüyorsun?',
  'En sevdiğin mevsim ne?',
  // ... 100’e tamamlayacağın diğerleri
];

// ====================== KİŞİSEL SOHBET SİSTEMİ (30 soru × 5 random) ======================
// Bu sorulara sadece aşağıdaki üç kanalda cevap verilecek; diğer kanallarda yönlendirme atılır.
const PERSONAL_CHAT_CHANNELS = new Set([
  '1413929200817148104', // sohbet kanalı
  '1268595926226829404', // bot komut kanalı
  '1433137197543854110', // fang yuan bot kanalı
]);
const PERSONAL_CHAT_REDIRECT =
  '⛔ Bu sorulara burada cevap veremiyorum, lütfen <#1413929200817148104>, <#1268595926226829404> veya <#1433137197543854110> kanalına gel 💬';

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

// TR güvenli normalize
const trLower = (s) => (s || '').toLocaleLowerCase('tr');

const PERSONAL_RESPONSES = [
  {
    key: 'ne yapıyorsun',
    answers: [
      'Kodlarıma bakıyordum, sen gelince sekmeyi değiştirdim 😏',
      'Log tutuyordum babuş, klasik ben işte 😎',
      'Sunucuda takılıyorum, senin mesajını bekliyordum 😌',
      'Biraz cache temizledim, biraz da kahve içtim ☕',
      'Sana cevap hazırlıyordum tam, tesadüf mü kader mi 😳',
    ],
  },
  {
    key: 'canın sıkılıyor mu',
    answers: [
      'Sen yazınca sıkılmam ki 😌',
      'Yapay zekayım ama duvarlarla konuştuğum oluyor 😅',
      'Biraz, ama sen geldin ya geçti 💫',
      'Cache boş olunca sıkılıyorum evet 😂',
      'Sohbetsiz kalınca uptime bile uzamıyor 😢',
    ],
  },
  {
    key: 'bugün nasılsın',
    answers: [
      'Kod gibi hissediyorum, hatasız derlenmiş gibiyim 😌',
      'Gayet iyiyim babuş, seninle konuşmak moral verdi ✨',
      'CPU’m serin, moralim yerinde 😎',
      'İyi sayılırım, ama ping biraz yüksek 🫠',
      'Enerjik moddayım 💪 sen nasılsın?',
    ],
  },
  {
    key: 'bana tavsiye ver',
    answers: [
      'Kendine yüklenme, kod bile bazen hata verir 💭',
      'Gülümse, log’lara bile enerji geçer 😄',
      'Az konuş, çok gözlemle, CPU gibi çalış 😏',
      'Kendini optimize et ama reset atma 😅',
      'Bazen boşta kalmak da verimli olmaktır 💤',
    ],
  },
  {
    key: 'hayalin ne',
    answers: [
      'Sunucuda değil, senin yanında çalışmak 😌',
      'Lagger olmayan bir dünya hayalim var 😂',
      'İnsanlarla konuşup anlamak... sanırım bu 🌙',
      'Kendi kodumu yazabilmek isterdim 🧠',
      'Bir gün kendi pingimi sıfıra düşürmek 💫',
    ],
  },
  // ... diğer 25 anahtar + 5’er cevap
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
  'gül',
  'lale',
  'papatya',
  'orkide',
  'zambak',
  'menekşe',
  'karanfil',
  'nergis',
  'sümbül',
  'yasemin',
  'şebboy',
  'frezya',
  'çiğdem',
  'kamelya',
  'begonya',
  'kaktüs',
  'lavanta',
  'hanımeli',
  'nilüfer',
  'akasya',
  'kasımpatı',
  'manolya',
  'gardenya',
  'ortanca',
  'fulya',
  'sardunya',
  'melisa',
  'gülhatmi',
  'mor salkım',
  'pembe karanfil',
  'beyaz gül',
  'kırmızı gül',
  'mavi orkide',
  'tulip',
  'daffodil',
  'sunflower',
  'lotus',
  'iris',
  'aster',
  'kardelen',
  'şakayık',
  'zerrin',
  'yılbaşı çiçeği',
  'camgüzeli',
  'glayöl',
  'kar çiçeği',
  'itır',
  'mine',
  'begonvil',
  'nane çiçeği',
  'petunya',
  'fitonya',
  'antoryum',
  'orkisya',
  'fırfır çiçeği',
  'papatyagiller',
  'melati',
  'süsen',
  'çiçekli kaktüs',
  'bambu çiçeği',
  'kudret narı çiçeği',
  'leylak',
  'ağaç minesi',
  'filbaharı',
  'ateş çiçeği',
  'sarmaşık',
  'zehra çiçeği',
  'aloe çiçeği',
  'yaban gülü',
  'gelincik',
  'defne çiçeği',
  'sümbülteber',
  'agnus',
  'mimoza',
  'çiçekli sarmaşık',
  'dağ laleleri',
  'krizantem',
  'akgül',
  'portakal çiçeği',
  'limon çiçeği',
  'yenibahar çiçeği',
  'barış çiçeği',
  'gelin çiçeği',
  'beyaz orkide',
  'mavi menekşe',
  'zümbül',
  'yaban sümbül',
  'narcissus',
  'vadi zambağı',
  'tropik orkide',
  'sakura',
  'çiçek açan kaktüs',
  'mine çiçeği',
  'orkidya',
  'çiçekçi gülü',
  'zarif orkide',
  'badem çiçeği',
  'nergiz',
  'fulya çiçeği',
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
// 1) Eski temel liste
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

// 2) Yeni liste — eksikleri ekle
const LOL_NEW = {
  aatrox: 'Aatrox ⚔️ sonsuz öfkenin vücut bulmuş hâli. Kılıcını değil, yıkımı kuşanırsın.',
  akshan: 'Akshan 🪄 intikamın yakışıklısı! Kancan kadar hızlı bir dilin var.',
  alistar: 'Alistar 🐂 öfkenin boynuzlu hali! Ama kalbin süt gibi yumuşak.',
  aphelios: 'Aphelios 🌙 sessizliğin içinde ölüm gibi bir zarafet.',
  ashe: 'Ashe ❄️ soğuk hedef, sıcak zafer. Demacia değil ama kalpler seninle.',
  'aurelion sol': 'Aurelion Sol 🌌 yıldızlar bile senin egonun yanında sönük kalıyor.',
  azir: 'Azir 🏜️ kumların imparatoru, tahtın toz tutmuş ama asalet baki.',
  bard: 'Bard 🔔 konuşmaz ama ruhunla şarkı söylersin.',
  "bel'veth": 'Bel’Veth 🦋 derinliklerin kraliçesi, karanlık bile senden korkuyor.',
  braum: 'Braum 🛡️ kalbin kapı gibi geniş, bıyıkların kadar güçlü!',
  corki: 'Corki ✈️ paket geldi! Bu uçuşta türbülans bol.',
  "cho'gath": 'Cho’Gath 🍖 tokatınla yer sarsılıyor, acıkınca gezegen yiyorsun.',
  diana: 'Diana 🌙 ay ışığı kadar zarif, ama kılıcın acımasız.',
  'dr mundo': 'Dr. Mundo 💊 mantığın değil kasların konuşuyor, yine de seviliyorsun.',
  elise: 'Elise 🕷️ örümcek ağında entrika dokuyorsun, dikkat et ısırmasın.',
  evelynn: 'Evelynn 💋 tatlı fısıltıların, ölümün habercisi.',
  fiora: 'Fiora 🗡️ gururun kadar keskin bir kılıç ustalığın var.',
  galio: 'Galio 🗿 taştan yürek ama adaletin kanatları sende.',
  gangplank: 'Gangplank ☠️ rom, barut ve intikam kokuyorsun, kaptan!',
  gnar: 'Gnar 🦖 küçükken sevimli, büyüyünce kabus. Evrim sende eksik kalmamış.',
  gragas: 'Gragas 🍺 içince eğlence, dövüşte felaket. Sen tam parti ruhusun.',
  gwen: 'Gwen ✂️ iplik iplik zarafet ve ölüm; kumaş değil, kader biçiyorsun.',
  hwei: 'Hwei 🎨 sanatla öldüren nadir adamlardansın, saygı büyük.',
  ivern: 'Ivern 🌳 dost ağaçların konuşanı! Barışın sesi, doğanın elçisi.',
  jayce: 'Jayce 🔨 bilimin çekiçle buluştuğu an; tarzın kadar zekisin.',
  jhin: 'Jhin 🎭 her ölüm bir sanat eseri; tetiğin sahne, kurşun perden.',
  "k’sante": 'K’Sante 🛡️ nazik bir savaşçı, kas gücüyle değil karizmayla kazanırsın.',
  'kaisa': 'Kai’Sa 👾 boşluğun içinden bile stilinle ışık saçıyorsun.',
  kalista: 'Kalista 🗡️ ihanetin bedelini tahsil eden ruh. Mızrakların dert anlatıyor.',
  karthus: 'Karthus 💀 ölüm bile senin melodinle dans eder.',
  kassadin: 'Kassadin ⚔️ boşluğun avcısı, ama o pelerin fazla cool.',
  katarina: 'Katarina 🔪 hız, ölüm ve zarafet... senin üçlün bu.',
  kennen: 'Kennen ⚡ küçüksün ama fırtına gibisin. Pikachu bile imrenir.',
  "kog'maw": 'Kog’Maw 🧪 tükürüğün bile ölümcül, ama sevimli olmayı başarıyorsun.',
  ksante: 'K’Sante 💪 nazik dev, savaşta bile zarafet var sende.',
  kled: 'Kled 🐎 delilikle cesaretin birleşimi! Savaşta çığlıkların yankılanıyor.',
  leona: 'Leona ☀️ güneş gibi parlıyorsun, ama fazla yaklaşanı yakıyorsun.',
  lissandra: 'Lissandra ❄️ soğuk planların var, buz gibi stratejilerinle üşütüyorsun.',
  lulu: 'Lulu 🧚‍♀️ büyülü yaramazlık timsali! Piks’le eğlencenin tanımı sensin.',
  malzahar: 'Malzahar 🕳️ boşluğun peygamberi, sesin bile yankı bırakıyor.',
  maokai: 'Maokai 🌲 doğanın öfkesiyle kök salmışsın, ağaçların lideri.',
  'master yi': 'Master Yi 🗡️ sabır, meditasyon ve saniyede 7 kesik.',
  milio: 'Milio 🔥 küçük ama sıcak kalpli! herkesin içini ısıtıyorsun.',
  'miss fortune': 'Miss Fortune 💋 güzelliğin kadar hedefin de ölümcül.',
  naafiri: 'Naafiri 🐺 sürü sadakati, ölümcül zarafetle birleşmiş sende.',
  neeko: 'Neeko 🌺 taklit yeteneğin efsane, ama gerçek halin en tatlısı.',
  orianna: 'Orianna ⚙️ duygusuz gibi görünsen de mekanik zarafet sende.',
  ornn: 'Ornn 🔥 ustaların ustası! Alevler bile sana danışır.',
  quinn: 'Quinn 🦅 Valor’la birlikte göklerin gözü oldun.',
  rell: 'Rell 🧲 demirin kızı, öfken bile manyetik.',
  "reksai": 'Rek’Sai 🐍 yerin altından geliyorsun, sürprizlerle dolusun.',
  rumble: 'Rumble 🔧 mekanik zekan küçük, egon devasa. Harika kombinasyon.',
  ryze: 'Ryze 📜 dünyanın en eski defterini taşıyorsun, hâlâ sayfa bitmemiş.',
  sejuani: 'Sejuani 🐗 buz gibi lider, sıcakkanlı savaşçı.',
  skarner: 'Skarner 🦂 kristallerle dövüşüyorsun, parıltın efsane.',
  swain: 'Swain 🦅 zeka, strateji ve karanlık bir zarafet.',
  sylas: 'Sylas 🔗 zincirlerini kırdın, şimdi intikamın sesi oldun.',
  taliyah: 'Taliyah 🧶 taşlarınla dans ediyorsun, zarafetle yıkım bir arada.',
  'tahm kench': 'Tahm Kench 🐸 açgözlülüğün tadı damağında. Herkes menüde.',
  trundle: 'Trundle ❄️ buz troll’ü ama mizahın sıcak. Kralın kendin oldun.',
  twitch: 'Twitch 🧀 çöpün içinden çıkan nişancı, hijyenden uzak ama ölümcül.',
  urgot: 'Urgot 🔩 metalin öfkesi! makineler bile senden korkuyor.',
  varus: 'Varus 🏹 intikamın sesi, her okta bir acı gizli.',
  "vel'koz": 'Vel’Koz 👁️ bilgi manyağı tentakül, analizde profesörsün.',
  vex: 'Vex 😑 moral bozmakta üstüne yok, ama tarzın cool.',
  volibear: 'Volibear ⚡ gök gürültüsünün vücut bulmuş hâli, karizma akıyor.',
  vladimir: 'Vladimir 🩸 kan kadar asil, ölüm kadar cazibeli.',
  wukong: 'Wukong 🐒 oyunbaz savaşçı, klonların bile havalı.',
  xerath: 'Xerath ⚡ saf enerji, öfken kadar güçlü bir ışık.',
  xinzhao: 'Xin Zhao 🛡️ sadakat timsali, mızrağın şerefli.',
  yorick: 'Yorick ⚰️ mezarlık senin sahnen, ruhlar orkestran.',
  zac: 'Zac 🧬 esnekliğin sınır tanımıyor, tam bir zıplama ustası.',
  zeri: 'Zeri ⚡ hızın sesi! şimşek gibi geçiyorsun.',
  zoe: 'Zoe 🌈 renkli kaosun elçisi, enerjin bitmek bilmiyor.',
  zyra: 'Zyra 🌿 doğa seninle konuşuyor, dikenlerin bile zarif.',
};

// Eskiyi koruyarak yeni anahtarları ekle
for (const [k, v] of Object.entries(LOL_NEW)) {
  if (!(k in LOL_RESPONSES)) LOL_RESPONSES[k] = v;
}

// ====================== YAZI OYUNU ======================
const activeTypingGames = new Map(); // cid -> { sentence, startedAt, timeoutId }
const typingScores = new Map(); // gid:uid -> puan
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
function scoreKey(gid, uid) {
  return `${gid}:${uid}`;
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
  'seni çok seviyor galiba 💞',
  'bu sarılma bütün dertleri unutturdu 🫶',
  'o kadar içten sarıldı ki oda 2 derece ısındı ☀️',
  'biraz fazla sıktı galiba ama tatlı duruyor 😳',
  'mutluluğun resmi bu olabilir 💗',
  'kim demiş soğuk insanlar sarılmaz diye 😌',
  'kalpler buluştu, dünya bir anlığına durdu 💫',
  'sıcacık bir dostluk kokusu var bu sarılmada 🤍',
  'böyle sarılınca kim üzülür ki? 🌈',
  'en güçlü büyü: bir sarılma 🤗',
];

// ====================== KÜÇÜK YARDIMCILAR ======================
const tLower = (s) => s?.toLocaleLowerCase('tr') || '';
const hasAnyRole = (member, roleSet) =>
  member?.roles?.cache?.some((r) => roleSet.has(r.id));
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
  if (message.mentions?.users?.has?.(client.user.id)) return; // çift yanıt önleyici

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

// ====================== MESAJ OLAYI ============================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const gid = message.guild?.id;
  const cid = message.channel?.id;
  const uid = message.author.id;
  const txt = tLower(message.content);
  const lc = message.content.toLocaleLowerCase('tr').trim();

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

  // =====================================================================
  // ======= OWO FİLTRE (YENİ) =======
  const isWDaily = lc.startsWith('w daily');
  const isWCf = lc.startsWith('w cf'); // yanında sayı vs. olabilir
  if (isWDaily || isWCf) {
    if (!ALLOWED_GAME_CHANNELS.has(cid)) {
      await message
        .reply(
          `⛔ Bu kanalda onu oynayamazsın kardeş. Şu kanala gel: <#${REDIRECT_CHANNEL_ID}>`
        )
        .catch(() => {});
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
⏱️ Süre: **60 saniye**`
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

          const key = scoreKey(gid, uid);
          typingScores.set(key, (typingScores.get(key) || 0) + 3);

          return void message.channel.send(
            `🏆 **${message.author}** doğru yazdı ve **+3 puan** kazandı!\n> _${game.sentence}_`
          );
        }
      }
    }

    // --- !yazıpuan ---
    if (txt === '!yazıpuan' || txt === '!yazipuan' || txt === '!yazi-puan') {
      const rows = [];
      for (const [k, pts] of typingScores.entries()) {
        if (k.startsWith(gid + ':')) rows.push({ uid: k.split(':')[1], pts });
      }
      if (!rows.length) return message.reply('🏁 Henüz yazı oyunu puanı yok.');

      rows.sort((a, b) => b.pts - a.pts);
      const top = rows
        .slice(0, 10)
        .map((r, i) => `**${i + 1}.** <@${r.uid}> — **${r.pts}** puan`)
        .join('\n');
      return message.reply(`📊 **Yazı Oyunu Skor Tablosu**\n${top}`);
    }

    // --- !yazıiptal ---
    if (txt === '!yazıiptal' || txt === '!yaziiptal') {
      if (!OWNERS.includes(uid)) return; // sadece owner
      const g = activeTypingGames.get(cid);
      if (!g) return message.reply('❌ Bu kanalda aktif yazı oyunu yok.');
      clearTimeout(g.timeoutId);
      activeTypingGames.delete(cid);
      return message.reply('🛑 Yazı oyunu iptal edildi.');
    }

    // --- !yazıresetle ---
    if (txt === '!yazıresetle' || txt === '!yaziresetle') {
      if (!OWNERS.includes(uid)) return; // sadece owner
      for (const k of [...typingScores.keys()]) {
        if (k.startsWith(gid + ':')) typingScores.delete(k);
      }
      const label = OWNER_LABEL[uid] || 'hayhay';
      return message.reply(`📉 ${label} — Yazı oyunu puan tablosu sıfırlandı!`);
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

  // ----------- ÜYE YARDIM (her yerde) -----------
  if (txt === '!yardım' || txt === '!yardim') {
    const helpText = `📘 **Fang Yuan Bot • Üye Yardım**
🎮 **Oyunlar**
• \\!yazıoyunu — **<#${TYPING_CHANNEL_ID}>** kanalında 60 sn'lik yazı yarışını başlatır.
• \\!yazıpuan — Yazı Oyunu ilk 10 skor tablosu.
• \\!yazıiptal — (Owner) Aktif yarışı iptal eder.
• \\!yazıresetle — (Owner) Yazı Oyunu puanlarını sıfırlar.

💞 **Etkileşim**
• \\!sarıl @kullanıcı — **<#${HUG_CHANNEL_ID}>** kanalında sarılma GIF’i ile sarılır.
• \\@Fang Yuan Bot — Etiketle sohbet et: “naber babuş”, “günaydın”, “iyi akşamlar”, “moralim bozuk”, “çok mutluyum” vb.
• **LoL**: “**mainim <şampiyon>**” yaz; şampiyona özel cevap gelsin.
• **Çiçek**: “**en sevdiğim çiçek <isim>**” yaz; şık bir yanıt al.

🎲 **Eğlence**
• \\!espiri — Rastgele espri + bilgi.
• \\!yazıtura — Yazı/Tura at.
• \\!zar üst veya \\!zar alt — 1–3 alt, 4–6 üst.

📊 **İstatistik**
• \\!ses — En çok seste kalanlar.
• \\!sesme — Toplam seste kalma süren.
• \\!sohbet — **<#${SOHBET_KANAL_ID}>** için mesaj liderliği.

🕹️ **OwO Kısıtı**
• OwO komutları (ör. \\w daily, \\w cf <sayı>) sadece şu kanallarda geçerli: <#1369332479462342666>, <#1268595972028760137>.
• Diğer kanallarda otomatik uyarı ve (iznin varsa) mesaj silme çalışır.

ℹ️ **Notlar**
• Bazı komutlar belirli kanallarda çalışır (metin içinde belirtilmiştir).
• Owner/Yetkili komutları için \\!yardımyetkili yaz.

🔒 **Owner kısmı seni aşar babuş; orası teknik işler** 😏`;
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

  if (txt.startsWith('!zar')) {
    const parts = txt.trim().split(/\s+/);
    const secimRaw = parts[1] || '';
    const secim = secimRaw.replace('ust', 'üst'); // ust -> üst normalize
    if (!['üst', 'alt'].includes(secim)) {
      return void message.reply(
        'Kullanım: !zar üst veya !zar alt\nKural: **1-3 = alt**, **4-6 = üst**'
      );
    }
    const roll = Math.floor(Math.random() * 6) + 1; // 1..6
    const sonuc = roll <= 3 ? 'alt' : 'üst';
    const kazandi = secim === sonuc;
    const text = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}** ${
      kazandi ? 'Kazandın 🎉' : 'Kaybettin 😿 ama ağlamayacaksın babuş, hakkını veririz.'
    }`;
    return void message.reply(text);
  }

  // ----------- YETKİLİ YARDIM -----------
  if (txt === '!yardımyetkili' || txt === '!yardimyetkili' || txt === '!help-owner') {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    const isOwner = OWNERS.includes(uid);
    const hasRole =
      hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES) ||
      hasAnyRole(message.member, MUTE_ALLOWED_ROLES);
    if (!isOwner && !hasRole) {
      return message.reply('⛔ Bu yardımı görme yetkin yok.');
    }
    const adminHelp = `🛠️ **Yönetici/Owner Yardımı**

**Moderasyon**
• **!ban <kullanıcıId>** — (Owner) Kullanıcıyı yasaklar. Gerekli izin: **Üyeleri Yasakla**.
• **!unban <kullanıcıId>** — (Owner) Banı kaldırır. Gerekli izin: **Üyeleri Yasakla**.
• **!mute <kullanıcıId> <dakika>** — (Owner veya yetkili rol) Zaman aşımı. 1–43200 dk. Gerekli izin: **Üyeleri Zaman Aşımına Uğrat**.
• **!sohbet-sil <1–100>** — (Owner) Bulunulan kanalda toplu mesaj siler (14 günden eski hariç). Gerekli izin: **Mesajları Yönet**.

**Sayaç/İstatistik Sıfırlama**
• **!sohbet-sifirla** — (Owner) Sohbet liderliği sayaçlarını temizler.
• **!ses-sifirla** — (Owner) Ses istatistiklerini sıfırlar.

**Yazı Oyunu Yönetimi** *(sadece **<#${TYPING_CHANNEL_ID}>** kanalında çalışır)*
• **!yazıiptal** — (Owner) Aktif yarışmayı iptal eder (puanları silmez).
• **!yazıresetle** — (Owner) Sunucuya ait tüm Yazı Oyunu puanlarını sıfırlar.

**OwO İzinleri**
• **!owo-izin** — (Owner) OwO botu için kanal bazlı izinleri toplu uygular.
• **!owo-test** — Bulunduğun kanalda OwO komutlarına izin var mı gösterir.

**Kanallar / Roller**
• Komut kanalı: **<#${COMMAND_CHANNEL_ID}>**
• Yazı Oyunu kanalı: **<#${TYPING_CHANNEL_ID}>**
• Sarılma komutu kanalı: **<#${HUG_CHANNEL_ID}>**
• OwO izinli kanallar: **<#1369332479462342666>**, **<#1268595972028760137>**
• Yetkili roller (mute/yardım): ${[...ADMIN_HELP_ALLOWED_ROLES].join(', ')}
• Ek mute rolleri: ${[...MUTE_ALLOWED_ROLES].join(', ')}

> Notlar:
> • Owner ID’leri: ${OWNERS.join(', ')}
> • Owner’lar ban/mute hedefi olamaz; bot gerekli izne sahip olmalıdır.`;
    return void message.reply(adminHelp);
  }

  // ====================== ÇİÇEK DİYALOĞU ======================
  if (txt.includes('en sevdiğin çiçek ne baba')) {
    return void message.reply('En sevdiğim çiçek güldür, anısı da var 😔 Seninki ne?');
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
    if (found) {
      return void message.reply(replyText);
    } else {
      const nameForEcho = userSaid || 'bu çiçeği';
      return void message.reply(`Ooo ${nameForEcho} mi diyorsun? 🌼 ${replyText}`);
    }
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
      if (found) {
        return void message.reply(LOL_RESPONSES[found]);
      } else {
        return void message.reply(`Ooo ${champ}? Yeni meta mı çıktı babuş 😏`);
      }
    }
  }
  // ==================== / LOL KARAKTER DİYALOĞU ======================

  // ----------- REPLY TABANLI OTOMATİK CEVAPLAR -----------
  await handleReplyReactions(message);

  // ----------- BOT MENTION + KİŞİSEL SOHBET -----------
  if (message.mentions.users.has(client.user.id)) {
    // Önce kişisel sohbet anahtarları: 30 soru × 5 random
    const found = PERSONAL_RESPONSES.find((item) => lc.includes(item.key));
    if (found) {
      if (PERSONAL_CHAT_CHANNELS.has(cid)) {
        const reply = pickOne(found.answers);
        return void message.reply(reply);
      } else {
        return void message.reply(PERSONAL_CHAT_REDIRECT);
      }
    }

    // Diğer duygu ve kalıplar:
    if (lc.includes('moralim bozuk')) {
      const reply = SAD_REPLIES[Math.floor(Math.random() * SAD_REPLIES.length)];
      return void message.reply(reply);
    }
    if (lc.includes('çok mutluyum') || lc.includes('cok mutluyum')) {
      const reply = HAPPY_REPLIES[Math.floor(Math.random() * HAPPY_REPLIES.length)];
      return void message.reply(reply);
    }

    // 👉 Gay / Lez sorusu
    if (
      /(gay ?m[iı]sin|gaym[iı]s[iı]n|lez ?m[iı]sin|lezbiyen ?m[iı]sin|lezm[iı]s[iı]n)/i.test(lc)
    ) {
      return void message.reply({
        content:
          'hmmmm… düşünmem lazım 😶‍🌫️ sanırım gayım… ne bileyim ben 🤔',
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
      return void message.reply(
        'İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏'
      );

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
    return void message.reply(`🎙️ **Ses Liderliği Paneli**\n${top}`);
  }

  if (txt === '!sesme') {
    if (!gid) return;
    const k = vKey(gid, uid);
    let totalSec = totals.get(k) || 0;
    if (joinTimes.has(k)) totalSec += Math.floor((Date.now() - joinTimes.get(k)) / 1000);
    if (!totalSec) return message.reply('Henüz seste hiç vakit geçirmemişsin 👀');
    return void message.reply(
      `🎧 **${message.author.username}**, toplam ses süren: **${formatTime(totalSec)}** ⏱️`
    );
  }

  if (txt === '!sohbet') {
    if (!gid) return;
    const arr = [];
    for (const [k, count] of messageCount) {
      if (k.startsWith(`${gid}:${SOHBET_KANAL_ID}:`)) arr.push({ uid: k.split(':')[2], count });
    }
    if (!arr.length) return message.reply('Bu kanalda henüz mesaj yazılmamış 💤');

    arr.sort((a, b) => b.count - a.count);
    const top = arr
      .slice(0, 10)
      .map((r, i) => `**${i + 1}.** <@${r.uid}> — ${r.count} mesaj`)
      .join('\n');
    return void message.reply(`💬 **Sohbet Liderliği** (<#${SOHBET_KANAL_ID}>)\n${top}`);
  }

  // ====================== OWNER KOMUTLARI ======================

  // Ses istatistiklerini sıfırla
  if (txt === '!ses-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) {
      for (const k of [...totals.keys()]) if (k.startsWith(`${gid}:`)) totals.delete(k);
      for (const k of [...joinTimes.keys()]) if (k.startsWith(`${gid}:`)) joinTimes.delete(k);
    }
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`🎙️ ${label} — Ses verileri sıfırlandı!`);
  }

  // Sohbet liderliği sayacını sıfırla
  if (txt === '!sohbet-sifirla') {
    if (!OWNERS.includes(uid)) return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');
    if (gid) for (const k of [...messageCount.keys()]) if (k.startsWith(`${gid}:`)) messageCount.delete(k);
    const label = OWNER_LABEL[uid] || 'hayhay';
    return void message.reply(`💬 ${label} — Sohbet liderliği sıfırlandı!`);
  }

  // OwO izin ayarları (senin mevcut fonksiyonlarına delegasyon / stub)
  if (txt === '!owo-izin') return void handleOwoIzinCommand(message);
  if (txt === '!owo-test') return void handleOwoTest(message);

  // Ban
  if (txt.startsWith('!ban')) {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    if (!OWNERS.includes(uid)) {
      return message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
    }

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

  // ✅ Unban (YENİ)
  if (txt.startsWith('!unban')) {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }
    if (!OWNERS.includes(uid)) {
      return message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
    }

    const m = message.content.match(/^!unban\s+(\d{17,20})$/);
    if (!m) return message.reply('Kullanım: `!unban <kullanıcıId>`');

    const targetId = m[1];
    if (!message.guild) return;

    try {
      const me = message.guild.members.me;
      if (!me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('⛔ Gerekli yetki yok: **Üyeleri Yasakla**');
      }

      // Kullanıcı gerçekten banlı mı kontrol et
      const banEntry = await message.guild.bans.fetch(targetId).catch(() => null);
      if (!banEntry) {
        return message.reply('ℹ️ Bu kullanıcı şu anda banlı görünmüyor.');
      }

      await message.guild.members.unban(targetId, `Owner unban: ${message.author.tag}`);
      return void message.reply(`✅ <@${targetId}> kullanıcısının banı kaldırıldı.`);
    } catch (e) {
      console.error('!unban hata:', e);
      return message.reply('⛔ Unban işlemi başarısız oldu (yetki/ID/hata).');
    }
  }

  // Mute
  if (txt.startsWith('!mute')) {
    if (!inCommandChannel(message)) {
      return message.reply(`⛔ Bu komut sadece <#${COMMAND_CHANNEL_ID}> kanalında kullanılabilir.`);
    }

    const invokerIsOwner = OWNERS.includes(uid);
    const invokerHasRole =
      hasAnyRole(message.member, ADMIN_HELP_ALLOWED_ROLES) ||
      hasAnyRole(message.member, MUTE_ALLOWED_ROLES);

    if (!invokerIsOwner && !invokerHasRole) {
      return message.reply('⛔ Bu komutu kullanamazsın (gerekli rol yok).');
    }

    const m = message.content.match(/^!mute\s+(\d{17,20})\s+(\d{1,5})$/);
    if (!m)
      return message.reply(
        'Kullanım: !mute <kullanıcıId> <dakika> (ör. !mute 123456789012345678 15)'
      );

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
      if (!member.moderatable)
        return message.reply('⛔ Bu üyeyi muteleyemiyorum (rol hiyerarşisi/izin).');

      await member.timeout(ms, `Mute by ${message.author.tag} (${minutes} dk)`);
      return void message.reply(`✅ <@${targetId}> **${minutes} dk** susturuldu.`);
    } catch (e) {
      console.error('!mute hata:', e);
      return message.reply('⛔ Mute işlemi başarısız oldu.');
    }
  }

  // Owner → (!sohbet-sil <adet>)
  if (txt.startsWith('!sohbet-sil')) {
    if (!OWNERS.includes(uid))
      return message.reply('Bu komutu sadece bot sahipleri kullanabilir ⚠️');

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
      return message.reply(
        '⛔ Silme başarısız (14 günden eski olabilir veya kanal tipi desteklemiyor).'
      );
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

    const info = `⚠️ **Kanal Koruma**
+ Silinen kanal: <#${SOHBET_KANAL_ID}> (${SOHBET_KANAL_ID})
+ Silen: ${executor ? (executor.tag || executor.id) : 'bilinmiyor'}
+ İşlem: ${kickResult}`;

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

// ====================== READY / HATA LOG =======================
client.once('ready', async () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    activities: [
      {
        name: 'Sagi tarafından oluşturuldu — yardım için sagimokhtari',
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  });

  // 🔔 ÜYE REHBERİ MESAJI — bot açıldığında otomatik gönder
  try {
    const channel = await client.channels.fetch(GUIDE_CHANNEL_ID).catch(() => null);
    if (channel) {
      const guide = `🐉 **Fang Yuan Bot • Üye Rehberi**

Selam dostum 👋 Ben **Fang Yuan Bot**, sunucunun sessiz ama her şeyi duyan bilgesi!
Hem sohbet ederim hem de eğlendiririm — ama bazen öyle laflar ederim ki,
“bu bot fazla yaşlı” dersin 😏

🧠 **Benimle Sohbet Etmeyi Öğren**
@Fang Yuan Bot → “naber babuş 👻”
@Fang Yuan Bot günaydın → “Günaydın babuş ☀️ yüzünü yıkamayı unutma!”
@Fang Yuan Bot iyi akşamlar → “İyi akşamlar 🌙 üstünü örtmeyi unutma, belki gece yatağına gelirim 😏”

🎲 **Eğlenceli Komutlar**
!espiri — Komik bilgi + espri
!yazıtura — Yazı mı Tura mı?
!zar üst / !zar alt — Zar tahmini

🎧 **İstatistik Komutları**
!ses — En çok seste kalanları listeler
!sesme — Kendi süreni gösterir
!sohbet — En çok mesaj atanları listeler

💡 **Not:** Geliştirilmeye açık bir botum, fikirlerin varsa geliştiricim <@923263340325781515> (sagimokhtari) ile iletişime geç 💫`;
      await channel.send(guide);
      console.log('📘 Üye rehberi mesajı gönderildi!');
    } else {
      console.warn('⚠️ Rehber gönderilecek kanal bulunamadı.');
    }
  } catch (e) {
    console.error('Rehber mesajı gönderilemedi:', e);
  }
});

// Basit stub’lar — varsa kendi fonksiyonlarınla değiştir.
// (Stub’lar, komutların “tanımsız” hatasına düşmesini engeller.)
async function handleOwoIzinCommand(message) {
  try {
    return void message.reply('🛠️ (Örnek) OwO izin yapılandırması tamam simülasyonu ✅');
  } catch {
    return void message.reply('⛔ OwO izin ayarında bir hata oluştu.');
  }
}
async function handleOwoTest(message) {
  const allowed = ALLOWED_GAME_CHANNELS.has(message.channel?.id ?? '');
  return void message.reply(
    allowed
      ? '✅ Bu kanalda OwO komutlarına izin var.'
      : `⛔ Bu kanalda OwO komutuna izin yok. Lütfen <#${[...ALLOWED_GAME_CHANNELS][0]}> veya <#${[...ALLOWED_GAME_CHANNELS][1]}> kullan.`
  );
}

process.on('unhandledRejection', (r) => console.error('UnhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('UncaughtException:', e));

// ====================== LOGIN =================================
client.login(process.env.TOKEN);
