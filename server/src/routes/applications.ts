import express, { Request, Response, NextFunction } from 'express';
import { ApplicationModel } from '../models/Application';
import { validate } from '../middleware/validation';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validation/schemas';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: (req: Request | AuthRequest, res: Response) => Promise<any>) => {
  return (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Route pour créer une nouvelle candidature (protégée)
router.post('/', authMiddleware, validate(createApplicationSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const applicationData = { ...req.body, applicant: req.user?.id };
  const application = new ApplicationModel(applicationData);
  await application.save();
  res.status(201).json(application);
}));

// Route pour récupérer toutes les candidatures (protégée)
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const applications = await ApplicationModel.find({
    $or: [
      { applicant: req.user?.id },
      { 'event.organizer': req.user?.id }
    ]
  }).populate('event').populate('applicant');
  res.json(applications);
}));

// Route pour récupérer une candidature par son ID (protégée)
router.get('/:applicationId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const application = await ApplicationModel.findById(applicationId)
    .populate('event')
    .populate('applicant');
    
  if (!application) {
    return res.status(404).json({ message: 'Candidature non trouvée' });
  }

  // Vérifier si l'utilisateur est le candidat ou l'organisateur de l'événement
  if (application.applicant.toString() !== req.user?.id && 
      application.event.organizer.toString() !== req.user?.id) {
    return res.status(403).json({ message: 'Non autorisé à voir cette candidature' });
  }

  res.json(application);
}));

// Route pour mettre à jour le statut d'une candidature (protégée)
router.put('/:applicationId/status', authMiddleware, validate(updateApplicationStatusSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  const application = await ApplicationModel.findById(applicationId).populate('event');
  if (!application) {
    return res.status(404).json({ message: 'Candidature non trouvée' });
  }

  // Vérifier si l'utilisateur est l'organisateur de l'événement
  if (application.event.organizer.toString() !== req.user?.id) {
    return res.status(403).json({ message: 'Non autorisé à modifier cette candidature' });
  }

  const updatedApplication = await ApplicationModel.findByIdAndUpdate(
    applicationId,
    { status },
    { new: true }
  ).populate('event').populate('applicant');

  res.json(updatedApplication);
}));

// Route pour supprimer une candidature (protégée)
router.delete('/:applicationId', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const application = await ApplicationModel.findById(applicationId).populate('event');
  
  if (!application) {
    return res.status(404).json({ message: 'Candidature non trouvée' });
  }

  // Vérifier si l'utilisateur est le candidat ou l'organisateur de l'événement
  if (application.applicant.toString() !== req.user?.id && 
      application.event.organizer.toString() !== req.user?.id) {
    return res.status(403).json({ message: 'Non autorisé à supprimer cette candidature' });
  }

  await ApplicationModel.findByIdAndDelete(applicationId);
  res.json({ message: 'Candidature supprimée avec succès' });
}));

export default router; 