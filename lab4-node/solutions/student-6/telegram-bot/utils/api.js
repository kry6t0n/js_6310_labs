import axios from 'axios';

const API_URL = `http://${process.env.API_HOST || 'localhost'}:${process.env.SERVER_PORT || 3000}/api`;

// Функция для получения данных с API
export async function getFromAPI(endpoint) {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    return null;
  }
}

// Функция для экранирования Markdown символов
export function escapeMarkdown(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}