import { CardValidatorService } from '../../src/services/card-validator.service';

describe('CardValidatorService', () => {
  let service: CardValidatorService;

  beforeEach(() => {
    service = new CardValidatorService();
  });

  describe('validateCardNumber - Valid Cases', () => {
    it('should validate valid 16-digit card numbers (Visa / Mastercard / Discover / JCB)', () => {
      // Verified valid test card numbers passing Luhn checksum
      const validNumbers = [
        '4532015112830366', // Visa
        '5412751234567898', // Mastercard
        '6011000990139424', // Discover
        '3566002020202020', // JCB
      ];

      validNumbers.forEach((cardNumber) => {
        const result = service.validateCardNumber(cardNumber);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedCardNumber).toBe(cardNumber);
      });
    });

    it('should handle formatted card numbers with spaces gracefully', () => {
      const formatted = '4532 0151 1283 0366';
      const result = service.validateCardNumber(formatted);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedCardNumber).toBe('4532015112830366');
    });

    it('should handle formatted card numbers with hyphens gracefully', () => {
      const formatted = '4532-0151-1283-0366';
      const result = service.validateCardNumber(formatted);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedCardNumber).toBe('4532015112830366');
    });

    it('should validate valid 15-digit card numbers (American Express standard)', () => {
      const amexCard = '378282246310005';
      const result = service.validateCardNumber(amexCard);
      expect(result.isValid).toBe(true);
    });

    it('should validate valid 14-digit card numbers (Diners Club standard)', () => {
      const dinersCard = '30000000000004';
      const result = service.validateCardNumber(dinersCard);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCardNumber - Invalid Cases & Edge Cases', () => {
    it('should fail validation when Luhn checksum is incorrect', () => {
      // 4532015112830367 has an altered checksum digit (should end in 6)
      const invalidLuhn = '4532015112830367';
      const result = service.validateCardNumber(invalidLuhn);
      expect(result.isValid).toBe(false);
      expect(result.errorReason).toContain('failed Luhn checksum');
    });

    it('should fail validation if length is under 13 digits', () => {
      const shortCard = '45320151128'; // 11 digits
      const result = service.validateCardNumber(shortCard);
      expect(result.isValid).toBe(false);
      expect(result.errorReason).toContain('between 13 and 19 digits');
    });

    it('should fail validation if length exceeds 19 digits', () => {
      const longCard = '45320151128303661234'; // 20 digits
      const result = service.validateCardNumber(longCard);
      expect(result.isValid).toBe(false);
      expect(result.errorReason).toContain('between 13 and 19 digits');
    });

    it('should fail validation when input contains non-numeric alphabetic characters', () => {
      const invalidChars = '4532abcd12830366';
      const result = service.validateCardNumber(invalidChars);
      expect(result.isValid).toBe(false);
      expect(result.errorReason).toContain('only numeric digits');
    });

    it('should fail validation when input contains special symbols', () => {
      const invalidSymbols = '4532@0151#1283$0366';
      const result = service.validateCardNumber(invalidSymbols);
      expect(result.isValid).toBe(false);
      expect(result.errorReason).toContain('only numeric digits');
    });

    it('should fail validation for empty string', () => {
      const result = service.validateCardNumber('');
      expect(result.isValid).toBe(false);
    });

    it('should fail validation for space-only string', () => {
      const result = service.validateCardNumber('   ');
      expect(result.isValid).toBe(false);
    });

    it('should fail validation gracefully for non-string inputs at runtime', () => {
      // @ts-expect-error Testing runtime invalid type handling
      const resultNumber = service.validateCardNumber(1234567890123456);
      expect(resultNumber.isValid).toBe(false);
      expect(resultNumber.errorReason).toContain('must be a string');

      // @ts-expect-error Testing runtime null handling
      const resultNull = service.validateCardNumber(null);
      expect(resultNull.isValid).toBe(false);

      // @ts-expect-error Testing runtime undefined handling
      const resultUndefined = service.validateCardNumber(undefined);
      expect(resultUndefined.isValid).toBe(false);
    });
  });
});
