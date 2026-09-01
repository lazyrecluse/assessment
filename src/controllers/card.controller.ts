import { Request, Response } from 'express';
import { CardValidatorService } from '../services/card-validator.service';

export class CardController {
  private cardValidatorService: CardValidatorService;

  constructor(cardValidatorService?: CardValidatorService) {
    this.cardValidatorService = cardValidatorService || new CardValidatorService();
  }

  /**
   * Controller handler for POST /api/v1/cards/validate
   */
  public validateCard = (req: Request, res: Response): void => {
    const { cardNumber } = req.body;
    const result = this.cardValidatorService.validateCardNumber(cardNumber);

    // According to selected API design (Option 2: Direct Simple JSON):
    // Returns 200 OK with { isValid: boolean } for evaluated requests
    res.status(200).json({
      isValid: result.isValid,
    });
  };
}
