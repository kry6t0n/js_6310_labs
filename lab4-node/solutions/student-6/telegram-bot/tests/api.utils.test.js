import { describe, test, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Правильно мокаем axios с использованием unstable_mockModule для ES модулей
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn()
  }
}));

// Динамически импортируем после моков
let axios;
let getFromAPI, escapeMarkdown;

beforeAll(async () => {
  // Импортируем axios после мока
  const axiosModule = await import('axios');
  axios = axiosModule.default;
  
  // Импортируем наши утилиты
  const apiUtils = await import('../utils/api.js');
  getFromAPI = apiUtils.getFromAPI;
  escapeMarkdown = apiUtils.escapeMarkdown;
});

describe('API Utilities', () => {
  beforeEach(() => {
    // Очищаем моки
    axios.get.mockClear();
    // Мокаем console.error для чистого вывода тестов
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Восстанавливаем console.error
    console.error.mockRestore();
  });

  describe('escapeMarkdown', () => {
    test('should escape markdown special characters', () => {
      const input = '_*[]()~`>#+-=|{}.!';
      const expected = '\\_\\*\\[\\]\\(\\)\\~\\`\\>\\#\\+\\-\\=\\|\\{\\}\\.\\!';
      expect(escapeMarkdown(input)).toBe(expected);
    });

    test('should handle empty string', () => {
      expect(escapeMarkdown('')).toBe('');
    });

    test('should handle regular text', () => {
      const text = 'Hello World';
      expect(escapeMarkdown(text)).toBe(text);
    });

    test('should handle mixed content', () => {
      const text = 'Hello _world_ and *everyone*!';
      const expected = 'Hello \\_world\\_ and \\*everyone\\*\\!';
      expect(escapeMarkdown(text)).toBe(expected);
    });

    test('should handle null and undefined', () => {
      expect(escapeMarkdown(null)).toBe(null);
      expect(escapeMarkdown(undefined)).toBe(undefined);
    });
  });

  describe('getFromAPI', () => {
    test('should successfully fetch data from API', async () => {
      const mockData = { status: 'success', data: { server: 'Test Server' } };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await getFromAPI('/config');
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/config',
        { timeout: 5000 }
      );
      expect(result).toEqual(mockData);
    });

    test('should handle API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await getFromAPI('/config');
      
      expect(result).toBeNull();
    });

    test('should handle timeout errors', async () => {
      axios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      const result = await getFromAPI('/config');
      
      expect(result).toBeNull();
    });

    test('should call different endpoints', async () => {
      axios.get.mockResolvedValue({ data: { status: 'success' } });

      await getFromAPI('/config');
      await getFromAPI('/status');
      await getFromAPI('/devices');
      
      expect(axios.get).toHaveBeenCalledTimes(3);
    });

    test('should use correct API URL', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await getFromAPI('/test');
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        { timeout: 5000 }
      );
    });
  });
});