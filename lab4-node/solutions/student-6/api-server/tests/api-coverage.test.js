import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';

let app;
let server;

beforeAll(async () => {
  // Устанавливаем env переменные для тестов
  process.env.NODE_ENV = 'test';
  process.env.SERVER_PORT = '3002';
  process.env.APP_NAME = 'Test Server';
  process.env.APP_VERSION = '1.0.0';
  
  // Импортируем app после установки env переменных
  const module = await import('../server.js');
  app = module.app;
  
  // Запускаем сервер на тестовом порту
  return new Promise((resolve) => {
    server = app.listen(3002, resolve);
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
});

describe('API Server Coverage Tests', () => {
  describe('GET /api/config', () => {
    test('should return server configuration with all properties', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('server');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body).toHaveProperty('system');
    });

    test('should have correct server structure', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.body.server).toMatchObject({
        name: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
        uptime: expect.any(Number),
        port: expect.any(Number)
      });
    });

    test('should include environment variables', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.body.server.name).toBe('Test Server');
      expect(response.body.server.environment).toBe('test');
    });
  });

  describe('GET /api/status', () => {
    test('should return operational status with services', async () => {
      const response = await request(app).get('/api/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('configSource');
    });

    test('should check bot token configuration', async () => {
      const response = await request(app).get('/api/status');
      
      expect(response.body.services.telegramBot).toBe('not_configured');
    });
  });

  describe('GET /api/projects/:id', () => {
    test('should return project by valid id', async () => {
      const response = await request(app).get('/api/projects/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'Проект 1');
      expect(response.body).toHaveProperty('environment', 'test');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('topology');
    });

    test('should handle different project ids', async () => {
      const responses = await Promise.all([
        request(app).get('/api/projects/1'),
        request(app).get('/api/projects/2')
      ]);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.id).toBeDefined();
      });
    });

    test('should have correct topology structure', async () => {
      const response = await request(app).get('/api/projects/1');
      
      expect(response.body.topology).toHaveProperty('nodes');
      expect(response.body.topology).toHaveProperty('edges');
      expect(Array.isArray(response.body.topology.nodes)).toBe(true);
      expect(Array.isArray(response.body.topology.edges)).toBe(true);
      
      if (response.body.topology.nodes.length > 0) {
        const node = response.body.topology.nodes[0];
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('type');
        expect(node).toHaveProperty('position');
        expect(node).toHaveProperty('data');
      }
    });
  });

  describe('GET /api/devices', () => {
    test('should return devices list with environment', async () => {
      const response = await request(app).get('/api/devices');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('devices');
      expect(response.body).toHaveProperty('environment', 'test');
      expect(Array.isArray(response.body.devices)).toBe(true);
    });

    test('should have correct device structure', async () => {
      const response = await request(app).get('/api/devices');
      
      expect(response.body.devices.length).toBeGreaterThan(0);
      
      const device = response.body.devices[0];
      expect(device).toHaveProperty('id');
      expect(device).toHaveProperty('name');
      expect(device).toHaveProperty('type');
      expect(device).toHaveProperty('ip');
      expect(device).toHaveProperty('status');
    });

    test('should contain all required device types', async () => {
      const response = await request(app).get('/api/devices');
      const deviceTypes = response.body.devices.map(device => device.type);
      
      expect(deviceTypes).toContain('router');
      expect(deviceTypes).toContain('switch');
      expect(deviceTypes).toContain('server');
    });
  });

  describe('GET /api/env', () => {
    test('should return environment info safely', async () => {
      const response = await request(app).get('/api/env');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('appName', 'Test Server');
      expect(response.body).toHaveProperty('environment', 'test');
      expect(response.body).toHaveProperty('port', '3002');
      expect(response.body).toHaveProperty('botConfigured', false);
      expect(typeof response.body.botConfigured).toBe('boolean');
    });

    test('should not expose sensitive information', async () => {
      const response = await request(app).get('/api/env');
      
      expect(response.body).not.toHaveProperty('BOT_TOKEN');
      expect(response.body).not.toHaveProperty('ADMIN_PASSWORD');
      expect(response.body).not.toHaveProperty('DATABASE_URL');
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle non-existent endpoints with 404', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      expect(response.status).toBe(404);
    });

    test('should handle CORS headers', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});