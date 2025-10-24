import { describe, test, expect, jest, beforeAll } from '@jest/globals';

// Мокаем все зависимости ПЕРЕД импортом хендлеров
jest.unstable_mockModule('telegraf', () => ({
  Markup: {
    keyboard: jest.fn(() => ({ 
      resize: jest.fn(() => ({ resize: true })) 
    })),
    inlineKeyboard: jest.fn(() => 'inline_keyboard')
  }
}));

// Мокаем наши утилиты
jest.unstable_mockModule('../utils/api.js', () => ({
  getFromAPI: jest.fn(),
  escapeMarkdown: jest.fn((text) => text)
}));

describe('Handlers Working Tests', () => {
  let messageHandlers;
  let getFromAPI;

  beforeAll(async () => {
    // Импортируем после моков
    const apiModule = await import('../utils/api.js');
    getFromAPI = apiModule.getFromAPI;
    
    messageHandlers = await import('../handlers/messageHandlers.js');
  });

  test('handleStatus should send status message when API available', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  const mockStatus = {
    services: {
      api: 'operational',
      database: 'operational',
      telegramBot: 'configured'
    },
    configSource: 'test'
  };
  getFromAPI.mockResolvedValue(mockStatus);

  await messageHandlers.handleStatus(mockCtx);

  expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
  expect(getFromAPI).toHaveBeenCalledWith('/status');
  expect(mockCtx.reply).toHaveBeenCalledWith(
    expect.stringContaining('🖥️ <b>Статус системы</b>'),
    { parse_mode: 'HTML' }
  );
});

test('handleStatus should handle API unavailable', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  getFromAPI.mockResolvedValue(null);

  await messageHandlers.handleStatus(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith('❌ API сервер недоступен');
});

test('handleSettings should send settings when API available', async () => {
  const mockCtx = {
    reply: jest.fn()
  };

  const mockEnv = {
    appName: 'Test App',
    environment: 'test',
    port: 3000,
    botConfigured: true
  };
  getFromAPI.mockResolvedValue(mockEnv);

  await messageHandlers.handleSettings(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith(
    expect.stringContaining('⚙️ <b>Настройки системы</b>'),
    { parse_mode: 'HTML' }
  );
});

test('handleSettings should handle API error', async () => {
  const mockCtx = {
    reply: jest.fn()
  };

  getFromAPI.mockResolvedValue(null);

  await messageHandlers.handleSettings(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить настройки');
});

test('handleProjects should send projects keyboard', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  await messageHandlers.handleProjects(mockCtx);

  expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
  expect(mockCtx.reply).toHaveBeenCalledWith('Выберите проект:', 'inline_keyboard');
});

test('handleDevices should send devices list when available', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  const mockDevices = {
    devices: [
      { name: 'Device 1', type: 'router', status: 'online' }
    ],
    environment: 'test'
  };
  getFromAPI.mockResolvedValue(mockDevices);

  await messageHandlers.handleDevices(mockCtx);

  console.log('Reply calls:', mockCtx.reply.mock.calls);
  
  expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
  expect(getFromAPI).toHaveBeenCalledWith('/devices');
  expect(mockCtx.reply).toHaveBeenCalledWith(
    expect.stringContaining('📡 Сетевые устройства:')
  );
});

test('handleDevices should handle no devices data', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  getFromAPI.mockResolvedValue({});

  await messageHandlers.handleDevices(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить список устройств');
});

test('handleDevices should handle API error', async () => {
  const mockCtx = {
    reply: jest.fn(),
    sendChatAction: jest.fn()
  };

  getFromAPI.mockResolvedValue(null);

  await messageHandlers.handleDevices(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить список устройств');
});

test('handleUnknownText should send help prompt', async () => {
  const mockCtx = {
    reply: jest.fn()
  };

  await messageHandlers.handleUnknownText(mockCtx);

  expect(mockCtx.reply).toHaveBeenCalledWith(
    expect.stringContaining('Используйте кнопки меню')
    // Убираем expect.any(Object) так как второй аргумент не передается
  );
});

  test('handleHelp should work without external dependencies', async () => {
    const mockCtx = {
      reply: jest.fn()
    };

    await messageHandlers.handleHelp(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Помощь'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleStart should send welcome message', async () => {
    const mockCtx = {
      reply: jest.fn()
    };

    await messageHandlers.handleStart(mockCtx);

    // Проверяем, что reply был вызван с правильным текстом
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Бот управления сетями'),
      expect.any(Object) // второй аргумент (клавиатура)
    );
  });

  test('handleConfig should handle API response', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn(),
      replyWithDocument: jest.fn()
    };

    const mockConfig = { test: 'config' };
    getFromAPI.mockResolvedValue(mockConfig);

    await messageHandlers.handleConfig(mockCtx);

    expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
    expect(getFromAPI).toHaveBeenCalledWith('/config');
    expect(mockCtx.reply).toHaveBeenCalled();
  });

  test('handleConfig should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    getFromAPI.mockResolvedValue(null);

    await messageHandlers.handleConfig(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить конфигурацию');
  });
});