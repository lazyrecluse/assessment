import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { validateCardRequestMiddleware } from '../middlewares/validate-request.middleware';

const router = Router();
const cardController = new CardController();

router.post(
  '/validate',
  validateCardRequestMiddleware,
  cardController.validateCard
);

export default router;
