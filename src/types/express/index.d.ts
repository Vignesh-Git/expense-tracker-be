import { IUser } from '../../models/User';

declare global {
  namespace Express {
    interface User extends IUser {
      _id: string;
      role: 'user' | 'admin';
    }
  }
} 