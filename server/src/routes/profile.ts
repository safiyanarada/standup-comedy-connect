import { Router, Request, Response, RequestHandler } from 'express';
import User from '../models/User';

const router = Router();

// Route pour mettre à jour le profil d'un utilisateur
router.put('/:userId', (async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs du profil si présents dans updateData
    if (updateData.profile) {
      // S'assurer que user.profile est un objet avant de fusionner
      user.profile = { ...(user.profile as object), ...updateData.profile };
    }

    // Mettre à jour d'autres champs de l'utilisateur (firstName, lastName, etc.)
    Object.assign(user, updateData);

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error });
  }
}) as RequestHandler);

export default router; 