import express, { Request, Response, NextFunction } from 'express';
import { EventModel } from '../models/Event';
import { validate } from '../middleware/validation';
import { createEventSchema, updateEventSchema } from '../validation/schemas';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: (req: Request | AuthRequest, res: Response) => Promise<any>) => {
  return (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Route pour créer un nouvel événement (protégée)
router.post('/', authMiddleware, validate(createEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const eventData = { ...req.body, organizer: req.user?.id };
  const event = new EventModel(eventData);
  await event.save();
  res.status(201).json(event);
}));

// Route pour récupérer tous les événements
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const events = await EventModel.find();
  res.json(events);
}));

// Route pour récupérer un événement par son ID
router.get('/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const event = await EventModel.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  res.json(event);
}));

// Route pour mettre à jour un événement (protégée)
router.put('/:eventId', authMiddleware, validate(updateEventSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const event = await EventModel.findById(eventId);
  
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }

  // Vérifier si l'utilisateur est l'organisateur de l'événement
  if (event.organizer.toString() !== req.user?.id) {
    return res.status(403).json({ message: 'Non autorisé à modifier cet événement' });
  }

  const updatedEvent = await EventModel.findByIdAndUpdate(eventId, req.body, { new: true });
  res.json(updatedEvent);
}));

// Route pour supprimer un événement (protégée)
router.delete('/:eventId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const event = await EventModel.findById(eventId);
  
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }

  // Vérifier si l'utilisateur est l'organisateur de l'événement
  if (event.organizer.toString() !== req.user?.id) {
    return res.status(403).json({ message: 'Non autorisé à supprimer cet événement' });
  }

  await EventModel.findByIdAndDelete(eventId);
  res.json({ message: 'Événement supprimé avec succès' });
}));

export default router; 