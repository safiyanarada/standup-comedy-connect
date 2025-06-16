import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import applicationRoutes from './routes/application';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/applications', applicationRoutes);

// Gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur du serveur:', err.message);
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 