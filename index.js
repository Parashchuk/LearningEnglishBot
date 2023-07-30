import express from 'express';
import { Telegraf } from 'telegraf';
import 'dotenv/config';
import transcriptAudio from './helpers/transcriptAudio.js';

//Configure express app
const app = express();
app.use(express.json());
app.use(express.static('static'));

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.status(200).send({ message: 'success' });
});

bot.command('start', (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, 'The command start doesnt do anything actually');
});

bot.on('text', (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, 'Unfortunatelly I cannot response for text messages yet');
});

bot.on('voice', async (ctx) => {
  try {
    bot.telegram.sendMessage(ctx.chat.id, 'Processing your voice message...');

    const voiceUrl = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const transcriptedText = await transcriptAudio(voiceUrl.href);

    bot.telegram.sendMessage(ctx.chat.id, 'The transcripted result: \n' + transcriptedText.text);
  } catch (error) {
    console.log(error);
  }
});

bot.launch();
app.listen(PORT, () => console.log('Server started on port ' + PORT));
