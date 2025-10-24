import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Network Bot System...\n');

// Запускаем API сервер
console.log('🔧 Starting API Server...');
const apiProcess = spawn('node', ['server.js'], {
  cwd: join(__dirname, 'api-server'),
  stdio: 'inherit',
  shell: true
});

// Ждем 3 секунды и запускаем бота
setTimeout(() => {
  console.log('🤖 Starting Telegram Bot...');
  const botProcess = spawn('node', ['bot.js'], {
    cwd: join(__dirname, 'telegram-bot'),
    stdio: 'inherit',
    shell: true
  });
}, 3000);

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Network Bot System...');
  process.exit(0);
});