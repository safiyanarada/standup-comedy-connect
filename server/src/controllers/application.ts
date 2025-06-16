import { Request, Response } from 'express';
import { ApplicationModel } from '../models/Application';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { EventDocument } from '../models/Event';
import { ApplicationDocument } from '../models/Application';
import { Event, Application } from '../types';
import { Types } from 'mongoose';

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, performanceDetails } = req.body;
    const comedianId = req.user?.id;

    if (!comedianId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Vérifier si l'événement existe
    const event = await EventModel.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Vérifier si l'utilisateur a déjà postulé
    const existingApplication = await ApplicationModel.findOne({
      event: eventId,
      comedian: comedianId
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied to this event' });
      return;
    }

    // Créer la candidature
    const application = new ApplicationModel({
      event: new Types.ObjectId(eventId),
      comedian: new Types.ObjectId(comedianId),
      performanceDetails,
      status: 'PENDING'
    });

    await application.save();

    // Ajouter la candidature à l'événement
    const eventDoc = event as EventDocument;
    eventDoc.applications.push(application._id as unknown as Types.ObjectId);
    await eventDoc.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

export const getEventApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user?.id;

    if (!organizerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Vérifier si l'organisateur est propriétaire de l'événement
    const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      res.status(404).json({ message: 'Event not found or unauthorized' });
      return;
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

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const organizerId = req.user?.id;

    if (!organizerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const application = await ApplicationModel.findById(applicationId)
      .populate({
        path: 'event',
        select: 'organizer'
      });

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    // Vérifier si l'organisateur est propriétaire de l'événement
    const applicationDoc = application as unknown as ApplicationDocument & { event: { organizer: Types.ObjectId } };
    if (applicationDoc.event.organizer.toString() !== organizerId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    applicationDoc.status = status;
    await applicationDoc.save();

    res.json({
      message: 'Application status updated successfully',
      application: applicationDoc
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

export const getComedianApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comedianId = req.user?.id;

    if (!comedianId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

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