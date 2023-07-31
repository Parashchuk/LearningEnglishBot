import express from 'express';
import { Telegraf } from 'telegraf';
import 'dotenv/config';

import voiceResponse from './commands/voise_response.js';
import startCommandResponse from './commands/start_command_response.js';
import textResponse from './commands/text_response.js';

//Configure express app and telegram bot
const app = express();
const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

//Exporess routes
app.get('/', (_, res) => {
  res.status(200).send({ message: 'success' });
});

//Bot routes
bot.command('start', startCommandResponse);
bot.on('text', textResponse);
bot.on('voice', voiceResponse);

//Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started on port ' + PORT));

//Launch bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
