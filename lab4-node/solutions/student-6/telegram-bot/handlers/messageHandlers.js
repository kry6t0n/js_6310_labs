import { Markup } from 'telegraf';
import { getFromAPI, escapeMarkdown } from '../utils/api.js';

export async function handleStart(ctx) {
  const keyboard = Markup.keyboard([
    ['📊 Конфигурация', '🔄 Статус'],
    ['📁 Проекты', '🖥️ Устройства'],
    ['⚙️ Настройки', '❓ Помощь']
  ]).resize();

  await ctx.reply(
    `🔧 ${process.env.APP_NAME || 'Бот управления сетями'}\n\n` +
    `Версия: ${process.env.APP_VERSION || '1.0.0'}\n` +
    `Режим: ${process.env.NODE_ENV || 'development'}\n\n` +
    'Выберите действие:',
    keyboard
  );
}

export async function handleConfig(ctx) {
  await ctx.sendChatAction('typing');
  const config = await getFromAPI('/config');
  
  if (config) {
    const configString = JSON.stringify(config, null, 2);
    if (configString.length > 2000) {
      await ctx.replyWithDocument({
        source: Buffer.from(configString),
        filename: `config-${new Date().toISOString().split('T')[0]}.json`
      });
    } else {
      await ctx.reply('<code>' + escapeMarkdown(configString) + '</code>', {
        parse_mode: 'HTML'
      });
    }
  } else {
    await ctx.reply('❌ Не удалось получить конфигурацию');
  }
}

export async function handleStatus(ctx) {
  await ctx.sendChatAction('typing');
  const status = await getFromAPI('/status');
  
  if (status) {
    const message = `
🖥️ <b>Статус системы</b>

<b>Приложение:</b> ${escapeMarkdown(process.env.APP_NAME || 'Network Bot')}
<b>Версия:</b> ${escapeMarkdown(process.env.APP_VERSION || '1.0.0')}
<b>Окружение:</b> ${escapeMarkdown(process.env.NODE_ENV || 'development')}

<b>API Сервер:</b> ${status.services?.api === 'operational' ? '✅' : '❌'} ${status.services?.api || 'unknown'}
<b>База данных:</b> ${status.services?.database === 'operational' ? '✅' : '❌'} ${status.services?.database || 'unknown'}
<b>Telegram Бот:</b> ${status.services?.telegramBot === 'configured' ? '✅' : '❌'} ${status.services?.telegramBot || 'unknown'}

<b>Время работы:</b> ${Math.floor(process.uptime() / 60)} минут
<b>Источник конфигурации:</b> ${status.configSource || '.env файл'}
    `.trim();
    
    await ctx.reply(message, { parse_mode: 'HTML' });
  } else {
    await ctx.reply('❌ API сервер недоступен');
  }
}

export async function handleSettings(ctx) {
  const envInfo = await getFromAPI('/env');
  
  if (envInfo) {
    const message = `
⚙️ <b>Настройки системы</b>

<b>Приложение:</b> ${escapeMarkdown(envInfo.appName || 'Не указано')}
<b>Окружение:</b> ${escapeMarkdown(envInfo.environment || 'Не указано')}
<b>Порт:</b> ${envInfo.port || 'Не указан'}
<b>Бот настроен:</b> ${envInfo.botConfigured ? '✅' : '❌'}

<b>Файл конфигурации:</b> .env
    `.trim();
    
    await ctx.reply(message, { parse_mode: 'HTML' });
  } else {
    await ctx.reply('❌ Не удалось получить настройки');
  }
}

export async function handleProjects(ctx) {
  await ctx.sendChatAction('typing');
  
  const keyboard = Markup.inlineKeyboard([
    [{ text: 'Проект 1', callback_data: 'project_1' }],
    [{ text: 'Проект 2', callback_data: 'project_2' }],
    [{ text: 'Проект 3', callback_data: 'project_3' }]
  ]);
  
  await ctx.reply('Выберите проект:', keyboard);
}

export async function handleDevices(ctx) {
  await ctx.sendChatAction('typing');
  const devices = await getFromAPI('/devices');
  
  if (devices && devices.devices) {
    const deviceList = devices.devices.map(device => 
      `• ${device.name} (${device.type}) - ${device.status}`
    ).join('\n');
    
    await ctx.reply(`📡 Сетевые устройства:\n\n${deviceList}\n\nОкружение: ${devices.environment || 'unknown'}`);
  } else {
    await ctx.reply('❌ Не удалось получить список устройств');
  }
}

export async function handleHelp(ctx) {
  const message = `
📋 <b>${escapeMarkdown(process.env.APP_NAME || 'Бот')} - Помощь</b>

<code>/start</code> - Начать работу
<code>/config</code> - Конфигурация сервера
<code>/status</code> - Статус системы
<code>/project &lt;id&gt;</code> - Получить проект
<code>/devices</code> - Список устройств

Или используйте кнопки меню ↓
  `.trim();
  
  await ctx.reply(message, { parse_mode: 'HTML' });
}

export async function handleUnknownText(ctx) {
  await ctx.reply(
    'Используйте кнопки меню или команды:\n' +
    '/start - Главное меню\n' +
    '/help - Помощь'
  );
}