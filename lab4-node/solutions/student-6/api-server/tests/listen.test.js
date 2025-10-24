import { jest, test, expect } from '@jest/globals';

test('server calls listen when NODE_ENV !== test', async () => {
  // Arrange: ensure we simulate non-test environment and a specific port
  process.env.NODE_ENV = 'development';
  process.env.SERVER_PORT = '41234';

  // Create a mock express app to intercept listen() calls
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn((port, cb) => {
      // simulate immediate callback invocation like a real server
      if (typeof cb === 'function') cb();
      return { close: jest.fn() };
    })
  };

  // Mock the 'express' module to return our mockApp and provide json() middleware
  await jest.unstable_mockModule('express', () => {
    const fn = () => mockApp;
    // attach json middleware to the function object to mimic express
    fn.json = () => (req, res, next) => next();
    return { default: fn };
  });

  // Act: import the server module which will call app.listen at import time
  await import('../server.js');

  // Assert: our mock listen was called and with the configured port
  expect(mockApp.listen).toHaveBeenCalled();
  const calledPort = mockApp.listen.mock.calls[0][0];
  expect(Number(calledPort)).toBe(Number(process.env.SERVER_PORT));

  // Cleanup: set NODE_ENV back to test for other tests
  process.env.NODE_ENV = 'test';
});
