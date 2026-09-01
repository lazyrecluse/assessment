import { Request, Response, NextFunction } from 'express';

export const validateCardRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { cardNumber } = req.body || {};

  if (cardNumber === undefined || cardNumber === null) {
    res.status(400).json({
      error: "Field 'cardNumber' is required.",
    });
    return;
  }

  if (typeof cardNumber !== 'string') {
    res.status(400).json({
      error: "Field 'cardNumber' must be a string.",
    });
    return;
  }

  if (cardNumber.trim() === '') {
    res.status(400).json({
      error: "Field 'cardNumber' cannot be empty.",
    });
    return;
  }

  next();
};
