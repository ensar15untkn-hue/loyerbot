const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.get('/', (_, res) => res.send('Bot aktif!'));
app.listen(3000, () => console.log('🌐 Web sunucusu çalışıyor.'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`🤖 Bot aktif: ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  // Biri botu etiketlediğinde cevap verir
  if (message.mentions.has(client.user)) {
    message.reply('naber lan 😎');
  }
});

// Buraya token YAZMA! Render'a environment olarak ekleyeceğiz
client.login(process.env.TOKEN);

