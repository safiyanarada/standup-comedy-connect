import { Request, Response } from 'express';
import { ApplicationModel } from '../models/Application';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, performanceDetails } = req.body;
    const comedianId = req.user?.id;

    // Vérifier si l'événement existe
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Vérifier si l'utilisateur a déjà postulé
    const existingApplication = await ApplicationModel.findOne({
      event: eventId,
      comedian: comedianId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Créer la candidature
    const application = new ApplicationModel({
      event: eventId,
      comedian: comedianId,
      performanceDetails,
      status: 'PENDING'
    });

    await application.save();

    // Ajouter la candidature à l'événement
    event.applications.push(application._id);
    await event.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

export const getEventApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user?.id;

    // Vérifier si l'organisateur est propriétaire de l'événement
    const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const applications = await ApplicationModel.find({ event: eventId })
      .populate('comedian', 'firstName lastName email profile')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get event applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const organizerId = req.user?.id;

    const application = await ApplicationModel.findById(applicationId)
      .populate({
        path: 'event',
        select: 'organizer'
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Vérifier si l'organisateur est propriétaire de l'événement
    if (application.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

export const getComedianApplications = async (req: AuthRequest, res: Response) => {
  try {
    const comedianId = req.user?.id;

    const applications = await ApplicationModel.find({ comedian: comedianId })
      .populate({
        path: 'event',
        select: 'title date location status'
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get comedian applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
}; 