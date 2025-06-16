import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { config } from '../config/env';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Créer un nouveau profil utilisateur
    const profile = {
      bio: '',
      experience: '',
      socialLinks: {},
      performances: []
    };

    // Créer le nouvel utilisateur
    const user = new UserModel({
      email,
      password,
      firstName,
      lastName,
      role,
      profile
    });

    await user.save();

    // Générer le token JWT
    if (!config.jwt.secret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      res.status(500).json({ message: 'Server configuration error.' });
      return;
    }
    const options: SignOptions = { expiresIn: 86400 }; // 24 heures en secondes
    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwt.secret as string,
      options
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Générer le token JWT
    if (!config.jwt.secret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      res.status(500).json({ message: 'Server configuration error.' });
      return;
    }
    const options: SignOptions = { expiresIn: 86400 }; // 24 heures en secondes
    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwt.secret as string,
      options
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error getting profile' });
  }
}; 