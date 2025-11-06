import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export const authorize = (req: any, res: any, next: NextFunction) => {
  console.log('here::::');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, _decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Pass control to the next middleware or route handler if token is valid.
    next();
  });
};