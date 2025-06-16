import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { updateProfileSchema } from '../validation/schemas';

const router = Router();

const asyncHandler = (fn: (req: Request | AuthRequest, res: Response) => Promise<any>) => {
  return (req: Request | AuthRequest, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

router.put('/:userId', authMiddleware, validate(updateProfileSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (req.user?.id !== userId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce profil' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.email) user.email = updateData.email;

    // Handle organizerProfile updates
    if (user.role === 'ORGANIZER') {
        if (!user.organizerProfile) {
            user.organizerProfile = { location: { city: '', postalCode: '' }, venueTypes: [] };
        }
        if (updateData.organizerProfile) {
            if (updateData.organizerProfile.companyName) user.organizerProfile.companyName = updateData.organizerProfile.companyName;
            if (updateData.organizerProfile.description) user.organizerProfile.description = updateData.organizerProfile.description;
            if (updateData.organizerProfile.website) user.organizerProfile.website = updateData.organizerProfile.website;
            if (updateData.organizerProfile.venueTypes) user.organizerProfile.venueTypes = updateData.organizerProfile.venueTypes;
            if (updateData.organizerProfile.eventFrequency) user.organizerProfile.eventFrequency = updateData.organizerProfile.eventFrequency;

            // Handle nested location update
            if (updateData.organizerProfile.location) {
                if (!user.organizerProfile.location) {
                    user.organizerProfile.location = { city: '', postalCode: '' };
                }
                if (updateData.organizerProfile.location.city) user.organizerProfile.location.city = updateData.organizerProfile.location.city;
                // Add other location fields if needed
            }
        }
    }

    await user.save();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
}));

export default router; 