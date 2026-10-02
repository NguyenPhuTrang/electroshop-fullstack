import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const accessToken = authHeader.split(' ')[1];
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string);
        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }       
        req.user = decoded;
        next();
    }   catch (error) { 
        console.error(error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token',
        });
    }   
};

export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // No token → continue as guest
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string
    );

    if (!decoded || typeof decoded === "string") {
      return next();
    }

    req.user = decoded;

    next();
  } catch (error) {
    next();
  }
};