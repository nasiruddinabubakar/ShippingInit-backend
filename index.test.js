const request = require('supertest');
const app = require('.');
const { afterEach, describe } = require('node:test');

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /users', () => {
  describe('given a username and password', () => {
    test('should respond with a 200 status code', async () => {
      const response = await request(app).post('/api/users/login').send({
        mail: 'nasiruddinabubakar@gmail.com',
        password: 'king',
      });
      expect(response.statusCode).toBe(200);
    });
    test('should specify json in the content type header', async () => {
      const response = await request(app).post('/api/users/login').send({
        mail: 'nasiruddinabubakar@gmail.com',
        password: 'king',
      });
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
    });
    test('response has userId', async () => {
      const response = await request(app).post('/api/users/login').send({
        mail: 'nasiruddinabubakar@gmail.com',
        password: 'king',
      });

      expect(response.body.user).toBeDefined();
    });
  });

  describe('not given a username and password', () => {
    test('should respond with a 400 status code', async () => {
      const response = await request(app).post('/api/users/login').send({});
      expect(response.statusCode).toBe(400);
    });
    test('should specify json in the content type header', async () => {
      const response = await request(app).post('/api/users/login').send({});
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
    });
    test('response has message', async () => {
      const response = await request(app).post('/api/users/login').send({});

      expect(response.body.message).toBeDefined();
    });
  });
});
