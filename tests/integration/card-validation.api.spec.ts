import request from 'supertest';
import app from '../../src/app';

describe('Card Validation API Integration Tests (POST /api/v1/cards/validate)', () => {
  describe('200 OK Responses (Evaluated Card Validation Requests)', () => {
    it('should return isValid: true for a valid card number string', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4532015112830366' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: true });
    });

    it('should return isValid: true for a valid formatted card number with spaces', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4532 0151 1283 0366' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: true });
    });

    it('should return isValid: true for a valid formatted card number with hyphens', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4532-0151-1283-0366' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: true });
    });

    it('should return isValid: false when Luhn checksum fails', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4532015112830367' }); // Altered digit

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: false });
    });

    it('should return isValid: false when card length is too short', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '123456789' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: false });
    });

    it('should return isValid: false when input contains alphabetic characters', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '453201511283abcd' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: false });
    });
  });

  describe('400 Bad Request Responses (Malformed / Bad Payloads)', () => {
    it('should return 400 Bad Request if cardNumber field is missing', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain("cardNumber' is required");
    });

    it('should return 400 Bad Request if cardNumber is not a string (e.g. number)', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: 4532015112830366 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be a string');
    });

    it('should return 400 Bad Request if cardNumber is an empty string', async () => {
      const response = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('cannot be empty');
    });
  });
});
