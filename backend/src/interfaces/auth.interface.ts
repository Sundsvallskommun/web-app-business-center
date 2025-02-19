import { User } from '@interfaces/users.interface';
import { Request } from 'express';
import { RepresentingEntity } from './representing.interface';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
  representing?: RepresentingEntity;
}
