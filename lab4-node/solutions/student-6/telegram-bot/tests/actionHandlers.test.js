import { describe, test, expect, jest, beforeAll, beforeEach } from '@jest/globals';

// Мокаем утилиты
jest.unstable_mockModule('../utils/api.js', () => ({
  getFromAPI: jest.fn(),
  escapeMarkdown: jest.fn((text) => text)
}));

describe('Action Handlers Tests', () => {
  let actionHandlers;
  let getFromAPI;

  beforeAll(async () => {
    const apiModule = await import('../utils/api.js');
    getFromAPI = apiModule.getFromAPI;
    actionHandlers = await import('../handlers/actionHandlers.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleProject1 should fetch project 1', async () => {
    const mockCtx = {
      reply: jest.fn(),
      answerCbQuery: jest.fn()
    };

    const mockProject = { name: 'Project 1' };
    getFromAPI.mockResolvedValue(mockProject);

    await actionHandlers.handleProject1(mockCtx);

    expect(getFromAPI).toHaveBeenCalledWith('/projects/1');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('📁 Проект 1:'),
      { parse_mode: 'HTML' }
    );
    expect(mockCtx.answerCbQuery).toHaveBeenCalled();
  });

  test('handleProject1 should handle API error', async () => {
    const mockCtx = {
      reply: jest.fn(),
      answerCbQuery: jest.fn()
    };

    getFromAPI.mockResolvedValue(null);

    await actionHandlers.handleProject1(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith('❌ Не удалось получить проект 1');
    expect(mockCtx.answerCbQuery).toHaveBeenCalled();
  });

  test('handleProject2 should fetch project 2', async () => {
    const mockCtx = {
      reply: jest.fn(),
      answerCbQuery: jest.fn()
    };

    const mockProject = { name: 'Project 2' };
    getFromAPI.mockResolvedValue(mockProject);

    await actionHandlers.handleProject2(mockCtx);

    expect(getFromAPI).toHaveBeenCalledWith('/projects/2');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('📁 Проект 2:'),
      { parse_mode: 'HTML' }
    );
  });

  test('handleProject3 should fetch project 3', async () => {
    const mockCtx = {
      reply: jest.fn(),
      answerCbQuery: jest.fn()
    };

    const mockProject = { name: 'Project 3' };
    getFromAPI.mockResolvedValue(mockProject);

    await actionHandlers.handleProject3(mockCtx);

    expect(getFromAPI).toHaveBeenCalledWith('/projects/3');
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('📁 Проект 3:'),
      { parse_mode: 'HTML' }
    );
  });
});