import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, location, requirements } = req.body;
    const organizerId = req.user?.id;

    const event = new EventModel({
      title,
      description,
      date,
      location,
      requirements,
      organizer: organizerId,
      status: 'DRAFT',
      applications: []
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, city } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (date) query.date = { $gte: new Date(date as string) };
    if (city) query['location.city'] = city;

    const events = await EventModel.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await EventModel.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate({
        path: 'applications',
        populate: {
          path: 'comedian',
          select: 'firstName lastName email profile'
        }
      });

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user?.id;

    const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      res.status(404).json({ message: 'Event not found or unauthorized' });
      return;
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { $set: req.body },
      { new: true }
    );

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user?.id;

    const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      res.status(404).json({ message: 'Event not found or unauthorized' });
      return;
    }

    await EventModel.findByIdAndDelete(eventId);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizerId = req.user?.id;

    const events = await EventModel.find({ organizer: organizerId })
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ message: 'Error fetching organizer events' });
  }
}; 