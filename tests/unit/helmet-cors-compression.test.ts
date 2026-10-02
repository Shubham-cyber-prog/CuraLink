import request from 'supertest';
import app from '../../src/app';

describe('Security Headers, Strict CORS, and Compression', () => {
  describe('Helmet & Security Headers', () => {
    it('should set security headers like nosniff, frameguard, and dns-prefetch', async () => {
      const response = await request(app).get('/');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });
  });

  describe('Strict CORS Enforcement', () => {
    it('should allow requests with no origin (e.g. native mobile app)', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });

    it('should allow explicitly allowed origin and reflect it in Access-Control-Allow-Origin', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should reject unauthorized origins not in ALLOWED_ORIGINS', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'https://malicious-attacker-site.com');

      expect(response.status).toBe(500); // Express CORS middleware forwards error to error handler
    });
  });

  describe('Compression Middleware', () => {
    it('should support gzip compression when Accept-Encoding is provided for larger payloads', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept-Encoding', 'gzip');

      expect(response.status).toBe(200);
    });
  });
});
