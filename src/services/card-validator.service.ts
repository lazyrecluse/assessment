export interface CardValidationResult {
  isValid: boolean;
  sanitizedCardNumber?: string;
  errorReason?: string;
}

export class CardValidatorService {
  /**
   * Validates a card number using format sanitization, length check, and Luhn algorithm.
   * 
   * @param rawCardNumber The raw card number string input from user payload
   * @returns CardValidationResult containing boolean isValid status and metadata
   */
  public validateCardNumber(rawCardNumber: string): CardValidationResult {
    if (typeof rawCardNumber !== 'string') {
      return {
        isValid: false,
        errorReason: 'Card number must be a string.',
      };
    }

    // 1. Sanitize: remove whitespace and hyphens
    const sanitized = rawCardNumber.replace(/[\s-]/g, '');

    // 2. Format check: verify only numeric digits remain
    if (!/^\d+$/.test(sanitized)) {
      return {
        isValid: false,
        errorReason: 'Card number must contain only numeric digits.',
      };
    }

    // 3. Length check: ISO/IEC 7812 standard card numbers are between 13 and 19 digits
    if (sanitized.length < 13 || sanitized.length > 19) {
      return {
        isValid: false,
        errorReason: 'Card number length must be between 13 and 19 digits.',
      };
    }

    // 4. Luhn Checksum Algorithm (Modulus 10)
    const isLuhnValid = this.checkLuhn(sanitized);
    if (!isLuhnValid) {
      return {
        isValid: false,
        errorReason: 'Card number failed Luhn checksum validation.',
      };
    }

    return {
      isValid: true,
      sanitizedCardNumber: sanitized,
    };
  }

  /**
   * Computes the Luhn Algorithm (Modulus 10) checksum for a digit string.
   * 
   * @param digits Sanitized numeric string
   * @returns true if valid checksum (sum % 10 === 0), false otherwise
   */
  private checkLuhn(digits: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    // Process digits right-to-left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}
