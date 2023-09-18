import { Router } from 'express';
import { validate } from 'express-validation';
import * as CardController from './card.controller';

const CardRoutes = Router();

CardRoutes.get("/", CardController.list);
CardRoutes.get("/:cardId", CardController.get)
CardRoutes.get("/carddata/:cardId", CardController.getcard)

CardRoutes.post("/", CardController.create)
CardRoutes.post("/:id/downloadPdf", CardController.downloadPdf)
CardRoutes.post("/addEmptyCards", CardController.createEmptyCards);

CardRoutes.delete("/deleteCard/:id", checkJwt, CardController.deleteCard);

export default CardRoutes;