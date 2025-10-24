import { describe, test, expect, jest, beforeAll, beforeEach } from '@jest/globals';

// Мокаем утилиты
jest.unstable_mockModule('../utils/api.js', () => ({
  getFromAPI: jest.fn(),
  escapeMarkdown: jest.fn((text) => text)
}));

describe('Command Handlers Tests', () => {
  let commandHandlers;
  let getFromAPI;

  beforeAll(async () => {
    const apiModule = await import('../utils/api.js');
    getFromAPI = apiModule.getFromAPI;
    commandHandlers = await import('../handlers/commandHandlers.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleConfigCommand should send config', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    const mockConfig = { test: 'config' };
    getFromAPI.mockResolvedValue(mockConfig);

    await commandHandlers.handleConfigCommand(mockCtx);

    expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
    expect(getFromAPI).toHaveBeenCalledWith('/config');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('<code>'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleConfigCommand should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    getFromAPI.mockResolvedValue(null);

    await commandHandlers.handleConfigCommand(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить конфигурацию');
  });

  test('handleStatusCommand should send status', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    const mockStatus = { status: 'ok' };
    getFromAPI.mockResolvedValue(mockStatus);

    await commandHandlers.handleStatusCommand(mockCtx);

    expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
    expect(getFromAPI).toHaveBeenCalledWith('/status');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('<code>'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleStatusCommand should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    getFromAPI.mockResolvedValue(null);

    await commandHandlers.handleStatusCommand(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить статус');
  });

  test('handleDevicesCommand should send devices', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    const mockDevices = { devices: [] };
    getFromAPI.mockResolvedValue(mockDevices);

    await commandHandlers.handleDevicesCommand(mockCtx);

    expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
    expect(getFromAPI).toHaveBeenCalledWith('/devices');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('<code>'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleDevicesCommand should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn()
    };

    getFromAPI.mockResolvedValue(null);

    await commandHandlers.handleDevicesCommand(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить устройства');
  });

  test('handleProjectCommand should handle project with ID', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn(),
      message: { text: '/project 2' }
    };

    const mockProject = { name: 'Project 2' };
    getFromAPI.mockResolvedValue(mockProject);

    await commandHandlers.handleProjectCommand(mockCtx);

    expect(mockCtx.sendChatAction).toHaveBeenCalledWith('typing');
    expect(getFromAPI).toHaveBeenCalledWith('/projects/2');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('<code>'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleProjectCommand should use default project ID when not specified', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn(),
      message: { text: '/project' }
    };

    const mockProject = { name: 'Project 1' };
    getFromAPI.mockResolvedValue(mockProject);

    await commandHandlers.handleProjectCommand(mockCtx);

    expect(getFromAPI).toHaveBeenCalledWith('/projects/1');
  });

  test('handleProjectCommand should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn(),
      message: { text: '/project 1' }
    };

    getFromAPI.mockResolvedValue(null);

    await commandHandlers.handleProjectCommand(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить проект 1');
  });
});