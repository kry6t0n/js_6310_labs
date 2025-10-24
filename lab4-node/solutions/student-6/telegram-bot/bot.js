import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Загружаем .env файл
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env file!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Импортируем обработчики
import * as messageHandlers from './handlers/messageHandlers.js';
import * as commandHandlers from './handlers/commandHandlers.js';
import * as actionHandlers from './handlers/actionHandlers.js';

// Регистрируем обработчики сообщений
bot.start(messageHandlers.handleStart);
bot.hears('📊 Конфигурация', messageHandlers.handleConfig);
bot.hears('🔄 Статус', messageHandlers.handleStatus);
bot.hears('⚙️ Настройки', messageHandlers.handleSettings);
bot.hears('📁 Проекты', messageHandlers.handleProjects);
bot.hears('🖥️ Устройства', messageHandlers.handleDevices);
bot.hears('❓ Помощь', messageHandlers.handleHelp);

// Регистрируем обработчики команд
bot.command('config', commandHandlers.handleConfigCommand);
bot.command('status', commandHandlers.handleStatusCommand);
bot.command('devices', commandHandlers.handleDevicesCommand);
bot.command('project', commandHandlers.handleProjectCommand);

// Регистрируем обработчики действий
bot.action('project_1', actionHandlers.handleProject1);
bot.action('project_2', actionHandlers.handleProject2);
bot.action('project_3', actionHandlers.handleProject3);

// Обработка неизвестных сообщений
bot.on('text', messageHandlers.handleUnknownText);

// Запуск бота
bot.launch().then(() => {
  console.log('🤖 Telegram Bot started successfully');
}).catch(error => {
  console.error('❌ Failed to start bot:', error);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };