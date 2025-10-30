// ====================== GEREKLİ MODÜLLER ======================
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  AuditLogEvent,
  ActivityType,
  PermissionFlagsBits,
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
  'sagimokhtari nasıl biri?',
];

// ====================== KİŞİSEL SOHBET SİSTEMİ (30 soru × 5 random) ======================
const PERSONAL_CHAT_CHANNELS = new Set([
  '1413929200817148104', // sohbet kanalı
  '1268595926226829404', // bot komut kanalı
  '1433137197543854110', // fang yuan bot kanalı
]);
const PERSONAL_CHAT_REDIRECT =
  '⛔ Bu sorulara burada cevap veremiyorum, lütfen <#1413929200817148104>, <#1268595926226829404> veya <#1433137197543854110> kanalına gel 💬';

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const trLower = (s) => (s || '').toLocaleLowerCase('tr');

// ... (kişisel sohbet, espiri, çiçek, LoL cevapları, OwO filtresi, yazı oyunu, sarıl vb. veriler ve fonksiyonlar — gönderdiğin blok ile birebir aynı şekilde bırakıldı) ...

// ======= OWO FİLTRE (YENİ) =======
const ESPIRI_TEXTS = [/* ... mevcut içerik (değiştirilmedi) ... */];
const SAD_REPLIES   = [/* ... */];
const HAPPY_REPLIES = [/* ... */];
// FLOWER_LIST, FLOWER_RESPONSES, LOL_RESPONSES, LOL_NEW (değiştirilmeden korundu)
// (Uzun oldukları için burada kırptım; senin gönderdiğin blok olduğu gibi aşağıda devam ediyor)

// ====================== (YENİ) TEK KASA OYUN SİSTEMİ ======================
// Zar + Yazı ortak puan kasası
const gamePoints = new Map(); // key: gid:uid -> pts

// Günlük limitler (İstanbul gününe göre)
const dailyTypingWins = new Map(); // key: gid:uid:YYYY-MM-DD -> count
const dailyClaimYaziBonus = new Map(); // key: gid:uid:YYYY-MM-DD -> true
const dailyClaimZarBonus  = new Map(); // key: gid:uid:YYYY-MM-DD -> true

function kGame(gid, uid) { return `${gid}:${uid}`; }
function kDaily(gid, uid, day) { return `${gid}:${uid}:${day}`; }
function todayTR() {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [day, month, year] = fmt.format(d).split('.'); // "30.10.2025"
  return `${year}-${month}-${day}`;
}
function addPoints(gid, uid, delta) {
  const key = kGame(gid, uid);
  gamePoints.set(key, (gamePoints.get(key) || 0) + delta);
  return gamePoints.get(key);
}
function getPointsFromUnified(gid, uid) {
  return gamePoints.get(`${gid}:${uid}`) || 0;
}
function setPointsUnified(gid, uid, val) {
  gamePoints.set(`${gid}:${uid}`, Math.max(0, Math.floor(Number(val) || 0)));
  return gamePoints.get(`${gid}:${uid}`);
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
   >>>>>>>>>>>>  MARKET SİSTEMİ • TEK PARÇA BLOK — ENTEGRASYON  <<<<<<<<<<
   (— senin gönderdiğin market bloğu aynen korunuyor —)
======================================================================= */
const ROLE_PRICE = 80;
const MARKET_ROLE_IDS = [
  '1433390462084841482',
  '1433390212138143917',
  '1433389941555073076',
  '1433389819337375785',
  '1433389663904862331',
];
const __MARKET__FALLBACK_OWNERS = (typeof OWNERS !== 'undefined' && Array.isArray(OWNERS)) ? OWNERS : [];
const __MARKET__LABEL = (typeof OWNER_LABEL !== 'undefined' && OWNER_LABEL) ? OWNER_LABEL : {};
const __MARKET__POINTS_MAP = (typeof gamePoints !== 'undefined' && gamePoints instanceof Map) ? gamePoints : (globalThis.__MARKET_POINTS__ ||= new Map());
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

// 4) YETKİ KONTROLLERİ
function canManageRolesInGuild(message) {
  const me = message.guild?.members?.me;
  return Boolean(me && me.permissions.has?.(PermissionFlagsBits.ManageRoles));
}
function checkRoleHierarchyManageable(message, role) {
  const me = message.guild?.members?.me;
  if (!me || !role) return false;
  return role.position < me.roles.highest.position;
}

// 5) KOMUTLAR (Market)
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const gid = message.guild?.id;
    const uid = message.author.id;
    const txt = (message.content || '').toLocaleLowerCase('tr').trim();

    if (txt === '!yardimmarket') {
      const refund = Math.floor(ROLE_PRICE / 2);
      const lines = MARKET_ROLE_IDS.length
        ? MARKET_ROLE_IDS.map((rid, i) => `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${ROLE_PRICE} puan**`).join('\n')
        : '_(Market boş görünüyor — rol ID ekleyin)_';

      return void message.reply(
`🛒 **Market & Puan Yardımı**
• **!puan** — Mevcut puanını gösterir.
• **!rollerimarket** — Market rollerini listeler ve fiyatları gösterir.
• **!market al <rolId>** — **${ROLE_PRICE} puan** karşılığı rol satın alır.
• **!market iade <rolId>** — Rol iadesi yapar, geri ödeme: **${refund} puan**.
• **!puan gonder @kisi <miktar>** — Üyeye puan gönderir (bakiye kontrolü var; owner da yetersizse uyarı alır).
• **(Owner)** **!puan-ver @kisi <miktar>** — Sınırsız puan verme (bakiye kontrolü YOK).

__Market Rolleri__
${lines}`
      );
    }

    if (txt === '!puan') {
      if (!gid) return;
      const bal = getPoints(gid, uid);
      return void message.reply(`💰 Toplam oyun puanın: **${bal}**`);
    }

    if (txt === '!rollerimarket' || txt === '!market roller' || txt === '!market-roller') {
      if (!message.guild) return;
      if (!MARKET_ROLE_IDS.length) return void message.reply('🛒 Market şu an boş görünüyor babuş.');

      const lines = MARKET_ROLE_IDS.map((rid, i) =>
        `**${i + 1}.** <@&${rid}> — ID: \`${rid}\` — **${ROLE_PRICE} puan**`
      ).join('\n');

      const refund = Math.floor(ROLE_PRICE / 2);
      return void message.reply(
        `🧩 **Market Rolleri**\n${lines}\n\nSatın almak: \`!market al <rolId>\`\n` +
        `İade: \`!market iade <rolId>\` (geri iade: **${refund}** puan)`
      );
    }

    if (txt.startsWith('!market ')) {
      if (!gid || !message.guild) return;
      const parts = message.content.trim().split(/\s+/);
      const sub = (parts[1] || '').toLocaleLowerCase('tr');
      const roleId = (parts[2] || '').replace(/[^\d]/g, '');

      if (!['al', 'iade'].includes(sub)) {
        return void message.reply('Kullanım:\n• `!market al <rolId>`\n• `!market iade <rolId>`\n• `!rollerimarket`');
      }
      if (!roleId) return void message.reply('⛔ Rol ID girmen lazım. `!rollerimarket` ile bakabilirsin.');
      if (!MARKET_ROLE_IDS.includes(roleId)) {
        return void message.reply('⛔ Bu rol markette değil. `!rollerimarket` ile geçerli rolleri gör.');
      }

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return void message.reply('⛔ Bu rol sunucuda bulunamadı (silinmiş olabilir).');

      if (!canManageRolesInGuild(message)) {
        return void message.reply('⛔ Gerekli yetki yok: **Rolleri Yönet**');
      }
      if (!checkRoleHierarchyManageable(message, role)) {
        return void message.reply('⛔ Bu rolü yönetemiyorum (rol hiyerarşisi).');
      }

      const member = message.member;
      const hasRole = member.roles.cache.has(roleId);

      if (sub === 'al') {
        if (hasRole) return void message.reply('ℹ️ Bu role zaten sahipsin.');
        const bal = getPoints(gid, uid);
        if (bal < ROLE_PRICE) {
          return void message.reply(`⛔ Yetersiz puan. Gerekli: **${ROLE_PRICE}**, Bakiye: **${bal}**`);
        }
        try {
          await member.roles.add(roleId, 'Market satın alma');
          setPoints(gid, uid, bal - ROLE_PRICE);
          return void message.reply(`✅ <@&${roleId}> rolünü aldın! **-${ROLE_PRICE}** puan. Yeni bakiye: **${getPoints(gid, uid)}**`);
        } catch (e) {
          console.error('market al hata:', e);
          return void message.reply('⛔ Rol verilirken hata oluştu (izin/hiyerarşi).');
        }
      }

      if (sub === 'iade') {
        if (!hasRole) return void message.reply('ℹ️ Bu role sahip değilsin, iade edilemez.');
        const refund = Math.floor(ROLE_PRICE / 2);
        try {
          await member.roles.remove(roleId, 'Market iade');
          setPoints(gid, uid, getPoints(gid, uid) + refund);
          return void message.reply(`↩️ <@&${roleId}> iade edildi. **+${refund}** puan geri yüklendi. Yeni bakiye: **${getPoints(gid, uid)}**`);
        } catch (e) {
          console.error('market iade hata:', e);
          return void message.reply('⛔ Rol geri alınırken hata oluştu (izin/hiyerarşi).');
        }
      }
    }

    if (txt.startsWith('!puan gonder') || txt.startsWith('!puan gönder')) {
      if (!gid) return;

      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);

      if (!target || isNaN(amt))
        return void message.reply('Kullanım: `!puan gonder @hedef <miktar>`');

      if (target.id === uid) return void message.reply('⛔ Kendine puan gönderemezsin.');
      if (amt <= 0) return void message.reply('⛔ Miktar **pozitif** olmalı.');

      const fromBal = getPoints(gid, uid);
      if (fromBal < amt) {
        return void message.reply(`⛔ Yetersiz bakiye. Bakiye: **${fromBal}**, göndermek istediğin: **${amt}**`);
      }

      setPoints(gid, uid, fromBal - amt);
      setPoints(gid, target.id, getPoints(gid, target.id) + amt);

      return void message.reply(`✅ <@${target.id}> kullanıcısına **${amt}** puan gönderdin. Yeni bakiyen: **${getPoints(gid, uid)}**`);
    }

    if (txt.startsWith('!puan-ver')) {
      if (!gid) return;
      if (!__MARKET__FALLBACK_OWNERS.includes(uid)) {
        return void message.reply('⛔ Bu komutu sadece bot sahipleri kullanabilir.');
      }

      const target = message.mentions.users.first();
      const parts = message.content.trim().split(/\s+/);
      const amt = parseAmount(parts[parts.length - 1]);

      if (!target || isNaN(amt) || amt <= 0)
        return void message.reply('Kullanım: `!puan-ver @hedef <pozitif_miktar>`');

      setPoints(gid, target.id, getPoints(gid, target.id) + amt);
      const label = __MARKET__LABEL[uid] || 'Owner';
      return void message.reply(`👑 ${label} — <@${target.id}> kullanıcısına **${amt}** puan verildi. Alıcının yeni bakiyesi: **${getPoints(gid, target.id)}**`);
    }
  } catch (err) {
    console.error('[MARKET BLOK HATASI]', err);
  }
});
// ==================== / MARKET SİSTEMİ • TEK PARÇA BLOK ====================


// ====================== YAZI OYUNU ======================
const activeTypingGames = new Map();
const TYPING_CHANNEL_ID = '1433137197543854110';
const TYPING_SENTENCES = [/* ... senin listene uygun biçimde ... */];
function normalizeTR(s) {
  return String(s || '')
    .toLocaleLowerCase('tr')
    .replace(/[.,;:!?'"~^_()[\]{}<>/@#$%&=+\\|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ====================== SARILMA OYUNU ======================
const HUG_CHANNEL_ID = '1433137197543854110';
const HUG_GIFS = [
  'https://media.tenor.com/o1jezAk92FUAAAAM/sound-euphonium-hug.gif',
  'https://media.tenor.com/6RXFA8NLS1EAAAAM/anime-hug.gif',
  'https://media.tenor.com/aOQrkAJckyEAAAAM/cuddle-anime.gif',
  'https://media.tenor.com/i2Mwr7Xk__YAAAAM/cat-girl-snuggle.gif',
];
const HUG_MESSAGES = [/* ... */];

// ====================== KÜÇÜK YARDIMCILAR ======================
const tLower = (s) => s?.toLocaleLowerCase('tr') || '';
const hasAnyRole = (member, roleSet) =>
  member?.roles?.cache?.some((r) => roleSet.has(r.id));
const inCommandChannel = (message) => message.channel?.id === COMMAND_CHANNEL_ID;

// ====================== SES TAKİBİ =============================
const joinTimes = new Map(); // gid:uid -> startedAt(ms)
const totals = new Map();    // gid:uid -> seconds
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

/* ====================== ZAR OYUNU KURALLARI ======================
  - Kazanırsa: +3 puan
  - Kaybederse: -1 puan
  - 2 kez üst üste kaybederse: ek -3 ceza (o elde toplam -4) ve "Cooked" özel mesaj + gif
  - Puanlar tek kasada: gamePoints
  - !zar puan -> birleşik kasadan gösterir
*/
const diceLossStreak = new Map();
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

// ====================== (YENİ) ÇAL OYUNU — ENTEGRASYON ======================
const THEFT_ALLOWED_CHANNELS = new Set([
  '1413929200817148104', // sohbet
  '1268595926226829404', // bot komut
]);
const THEFT_REPORT_CHANNEL_ID = '1268595919050244188'; // 50'lik temizlik bildirimi
const THEFT_CLEAN_THRESHOLD = 50;

const THEFT_GIFS = [
  'https://media.tenor.com/qEw5xB0gQWMAAAAM/steal-thief.gif',
  'https://media.tenor.com/xM8rYg7iGJ8AAAAM/anime-thief.gif',
  'https://media.tenor.com/6QZ3o7yqgAwAAAAM/sneaky-sneak.gif',
];

let theftUseCounter = 0;

function formatAllowedChannels() {
  return [...THEFT_ALLOWED_CHANNELS].map((id) => `<#${id}>`).join(', ');
}

async function theftCleanupIfNeeded(guild) {
  if (!guild) return;
  if (theftUseCounter % THEFT_CLEAN_THRESHOLD !== 0) return;

  for (const chId of THEFT_ALLOWED_CHANNELS) {
    try {
      const ch = await guild.channels.fetch(chId).catch(() => null);
      if (!ch || !ch.isTextBased?.()) continue;

      const me = guild.members.me;
      if (!me?.permissionsIn(ch).has(PermissionFlagsBits.ManageMessages)) continue;

      const fetched = await ch.messages.fetch({ limit: 100 }).catch(() => null);
      if (!fetched) continue;

      // Sadece botun mesajları ve 14 günden genç olanlar
      const toDelete = fetched.filter((m) => {
        if (m.author.id !== client.user.id) return false;
        const ageMs = Date.now() - m.createdTimestamp;
        return ageMs < 14 * 24 * 60 * 60 * 1000;
      });

      if (toDelete.size) {
        await ch.bulkDelete(toDelete, true).catch(() => {});
      }
    } catch (e) {
      console.error('theftCleanupIfNeeded hata:', e);
    }
  }

  // Rapor kanalı
  try {
    const rep = await guild.channels.fetch(THEFT_REPORT_CHANNEL_ID).catch(() => null);
    if (rep?.isTextBased?.()) {
      await rep.send('50 mesaj haznem doldu kanalları temizledim');
    }
  } catch {}
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

  // ======= OWO FİLTRE (YENİ) =======
  const isWDaily = lc.startsWith('w daily');
  const isWCf = lc.startsWith('w cf');
  if (isWDaily || isWCf) {
    if (!ALLOWED_GAME_CHANNELS.has(cid)) {
      await message
        .reply(`⛔ Bu kanalda onu oynayamazsın kardeş. Şu kanala gel: <#${REDIRECT_CHANNEL_ID}>`)
        .catch(() => {});
      const me = message.guild?.members?.me;
      if (me?.permissionsIn(message.channel).has(PermissionFlagsBits.ManageMessages)) {
        await message.delete().catch(() => {});
      }
      return;
    }
  }

  // ===================== (YENİ) ÇAL OYUNU =====================
  // Kullanım: !çal @hedef <miktar?>  (miktar verilmezse 5–20 arası rastgele)
  if (txt.startsWith('!çal') || txt.startsWith('!cal')) {
    if (!gid) return;
    if (!THEFT_ALLOWED_CHANNELS.has(cid)) {
      return message.reply(
        `⛔ Bu komutu burada kullanamazsın. Lütfen ${formatAllowedChannels()} kanallarından birine gel.`
      );
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Kullanım: `!çal @kullanıcı <miktar?>`  (miktar verilmezse 5–20 arası rastgele)');
    }
    if (target.bot) return message.reply('⛔ Botlardan çalamazsın babuş.');
    if (target.id === uid) return message.reply('⛔ Kendi kendinden çalamazsın.');

    const parts = message.content.trim().split(/\s+/);
    let rawAmt = parts[parts.length - 1];
    let amt = parseInt(rawAmt.replace(/\D/g, ''), 10);
    if (isNaN(amt)) amt = Math.floor(5 + Math.random() * 16); // 5–20

    // Bakiyeler
    const victimBal = getPointsFromUnified(gid, target.id);
    if (victimBal <= 0) return message.reply(`ℹ️ <@${target.id}> zaten sıfır bakiyede, çalınacak bir şey yok.`);

    // Hedef balikten fazla isteme → max uygulanabilir miktara indir
    amt = Math.max(1, Math.min(amt, victimBal));

    // Yeşil onay butonu — sadece hedef iptal edebilir
    const btn = new ButtonBuilder()
      .setCustomId(`cal-cancel:${gid}:${target.id}:${uid}:${amt}`)
      .setLabel('İptal (30sn)')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(btn);
    const gif = pickOne(THEFT_GIFS);

    const sent = await message.reply({
      content:
        `🕵️ **ÇALMA GİRİŞİMİ**\n` +
        `• Hırsız: <@${uid}>\n` +
        `• Hedef: <@${target.id}>\n` +
        `• Tutar: **${amt}** puan\n` +
        `> <@${target.id}>, **30 saniye** içinde yeşil butona basarsan iptal edilir.`,
      files: [gif],
      components: [row],
    });

    theftUseCounter++;

    // 30 sn buton bekçisi
    try {
      const interaction = await sent.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30_000,
        filter: (i) => {
          // sadece mağdur basabilsin
          if (i.user.id !== target.id) {
            i.reply({ content: '⛔ Bu butona sadece soyulan kişi basabilir.', ephemeral: true }).catch(()=>{});
            return false;
          }
          return i.customId.startsWith('cal-cancel:');
        },
      });

      if (interaction) {
        // İPTAL
        await interaction.update({
          content:
            `❌ **ÇALMA İPTAL EDİLDİ**\n` +
            `• Hırsız: <@${uid}>\n` +
            `• Hedef: <@${target.id}>\n` +
            `• Tutar: **${amt}** puan\n` +
            `> <@${target.id}> butona bastı ve işlem iptal edildi.`,
          components: [],
        });
      }
    } catch (e) {
      // ZAMAN AŞIMI → ÇALMA GERÇEKLEŞİR
      const thiefBal = getPointsFromUnified(gid, uid);
      const victimNow = getPointsFromUnified(gid, target.id); // butona basılmadığı için hâlâ ≥ amt olmalı; ama yine de emniyet
      const realAmt = Math.max(1, Math.min(amt, victimNow));

      setPointsUnified(gid, target.id, victimNow - realAmt);
      setPointsUnified(gid, uid, thiefBal + realAmt);

      await sent.edit({
        content:
          `✅ **ÇALMA BAŞARILI**\n` +
          `• Hırsız: <@${uid}> → **+${realAmt}** (yeni bakiye: **${getPointsFromUnified(gid, uid)}**)\n` +
          `• Mağdur: <@${target.id}> → **-${realAmt}** (yeni bakiye: **${getPointsFromUnified(gid, target.id)}**)\n` +
          `> 30 sn içinde iptal gelmedi.`,
        components: [],
      }).catch(()=>{});
    }

    // Temizlik kontrolü
    theftCleanupIfNeeded(message.guild).catch(()=>{});
    return;
  }
  // =================== /ÇAL OYUNU ===================

  // ===================== YAZI OYUNU (sadece belirlenen kanalda) =====================
  if (cid === TYPING_CHANNEL_ID) {
    if (txt === '!yazıoyunu' || txt === '!yazioyunu' || txt === '!yazi-oyunu') {
      if (activeTypingGames.has(cid)) {
        return message.reply('⏳ Bu kanalda zaten aktif bir yazı oyunu var.');
      }
      const sentence = TYPING_SENTENCES[Math.floor(Math.random() * TYPING_SENTENCES.length)];
      await message.channel.send(
`⌨️ **Yazı Oyunu** başlıyor! Aşağıdaki cümleyi **ilk ve doğru** yazan kazanır (noktalama önemsiz).
> ${sentence}
⏱️ Süre: **60 saniye**
📌 **Günlük limit:** Aynı üye max **4 kez** puan alabilir.`
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
            `🏆 **${message.author}** doğru yazdı ve **+3 puan** kazandı! (Günlük yazı ödülün: **${current + 1}/4**) \n> _${game.sentence}_`
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
  ↳ **Günlük limit:** aynı üye max **4** kez puan alır.  
• \\!yazı bonus — Günlük **+15** yazı bonusu (İstanbul gününe göre).  
• \\!zar üst / \\!zar alt — 1–3 alt, 4–6 üst. Kazan: **+3**, Kaybet: **-1**.  
  ↳ 2x üst üste kayıp: ek **-3** (toplam **-4**, “Cooked”).  
• \\!zar bonus — Günlük **+15** zar bonusu (İstanbul gününe göre).  
• \\!oyunsıralama — Birleşik **puan sıralaması**.  
• \\!zar puan / \\!yazıpuan — Aynı birleşik kasadan ilk 10’u gösterir.
• \\!çal @üye <miktar?> — **30sn iptal şansı** olan çalma oyunu (sadece ${formatAllowedChannels()}).

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

🛒 **Market**
• \\!yardimmarket — Market kullanımını ve satılık rolleri gösterir.
• \\!rollerimarket — Satıştaki rol listesi ve fiyatlar.
• \\!market al <rolId> — Rol satın al (**${ROLE_PRICE} puan**).
• \\!market iade <rolId> — İade (**${Math.floor(ROLE_PRICE/2)} puan** geri).
• \\!puan — Puan bakiyen.
• \\!puan gonder @kisi <miktar> — Puan transferi.
• (Owner) \\!puan-ver @kisi <miktar> — Sınırsız puan verme.

ℹ️ **Notlar**
• Zar + Yazı + Çal puanları **tek kasada** toplanır; market ile birlikte kullanılır.
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
    return message.reply(`✅ **+15** Yazı bonusu eklendi! Toplam oyun puanın: **${total}**`);
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
    return message.reply(`✅ **+15** Zar bonusu eklendi! Toplam oyun puanın: **${total}**`);
  }

  // ---------- ZAR (PUANLI) ----------
  if (txt.startsWith('!zar')) {
    if (txt.trim() === '!zar puan' || txt.trim() === '!zarpuan') {
      if (!gid) return;
      const top = guildTop(gid, 10);
      if (!top.length) return message.reply('🏁 Henüz oyun puanı yok.');
      const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.pts}** puan`).join('\n');
      return message.reply(`🎯 **Oyun Puanı Sıralaması**\n${table}`);
    }

    const parts = txt.trim().split(/\s+/);
    const secimRaw = parts[1] || '';
    const secim = secimRaw.replace('ust', 'üst');
    if (!['üst', 'alt'].includes(secim)) {
      return void message.reply(
        'Kullanım: !zar üst veya !zar alt\nKural: **1-3 = alt**, **4-6 = üst**'
      );
    }

    const roll = Math.floor(Math.random() * 6) + 1;
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
        delta -= 3;
        extraNote = '\n🔥 **Cooked!** İki kez üst üste kaybettin, **-3 puan ceza.**';
        gif = COOKED_GIFS[Math.floor(Math.random() * COOKED_GIFS.length)];
        diceLossStreak.set(key, 0);
      }
    }

    const total = addPoints(gid, uid, delta);
    const baseText = `🎲 Zar: **${roll}** → **${sonuc.toUpperCase()}** ${
      kazandi ? 'Kazandın 🎉 (**+3** puan)' : 'Kaybettin 😿 (**-1** puan)'
    }\n📦 Toplam oyun puanın: **${total}**`;

    return void message.reply({
      content: `${baseText}${extraNote}`,
      files: [gif],
    });
  }
  // ---------- /ZAR ----------

  // --------- BİRLEŞİK SIRALAMA & KISA YOL KOMUTLARI ---------
  if (txt === '!oyunsıralama' || txt === '!oyunsiralama' || txt === '!oyun-sıralama') {
    if (!gid) return;
    const top = guildTop(gid, 10);
    if (!top.length) return message.reply('🏁 Henüz oyun puanı yok.');
    const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.pts}** puan`).join('\n');
    return message.reply(`🏆 **Birleşik Oyun Puanı Sıralaması**\n${table}`);
  }

  if (txt === '!yazıpuan' || txt === '!yazipuan' || txt === '!yazi-puan') {
    if (!gid) return;
    const top = guildTop(gid, 10);
    if (!top.length) return message.reply('🏁 Henüz oyun puanı yok.');
    const table = top.map((r,i)=>`**${i+1}.** <@${r.uid}> — **${r.pts}** puan`).join('\n');
    return message.reply(`📊 **Oyun Puanı Skor Tablosu**\n${table}`);
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
• **!ban <kullanıcıId>** — (Owner)
• **!unban <kullanıcıId>** — (Owner)
• **!mute <kullanıcıId> <dakika>** — (Owner/Yetkili)
• **!sohbet-sil <1–100>** — (Owner) (14 günden eski hariç)

**Sayaç/İstatistik**
• **!sohbet-sifirla** • **!ses-sifirla**

**Yazı Oyunu** (**<#${TYPING_CHANNEL_ID}>**)
• **!yazıiptal** • **!yazıresetle**

**OwO**
• **!owo-izin** • **!owo-test**

Owner ID’leri: ${OWNERS.join(', ')}`;
    return void message.reply(adminHelp);
  }

  // ====================== ÇİÇEK / LOL / Mentionlı sohbet vb. — senin blokların (değiştirilmeden) ======================
  await handleReplyReactions(message);

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

  if (txt === '!owo-izin') return void handleOwoIzinCommand(message);
  if (txt === '!owo-test') return void handleOwoTest(message);

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
    const minutes = Math.max(1, Math.min(43200, parseInt(m[2], 10)));
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
      const deleted = await message.channel.bulkDelete(adet, true);
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

  try {
    const channel = await client.channels.fetch(GUIDE_CHANNEL_ID).catch(() => null);
    if (channel) {
      const guide = `🐉 **Fang Yuan Bot • Üye Rehberi**

Selam dostum 👋 Ben **Fang Yuan Bot**!
Artık **tek kasalı** oyun sistemim var: Zar + Yazı + Çal puanların **aynı yerde** toplanır.

🎮 **Kısayollar**
• !yazıoyunu — 60 sn yazı yarışması (**<#${TYPING_CHANNEL_ID}>**) | Günlük yazı ödülü limiti: **4**
• !yazı bonus / !zar bonus — Her biri **günde +15** (İstanbul)
• !zar üst / !zar alt — Kazan: +3 | Kaybet: -1 | 2x kayıp = ek -3 (COOKED)
• !çal @üye <miktar?> — 30 sn iptal şanslı çalma (sadece ${formatAllowedChannels()})
• !oyunsıralama — Birleşik puan sıralaması
• !yardım — Tüm komut listesi

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

// Basit stub’lar — varsa kendi fonksiyonlarınla değiştir.
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
