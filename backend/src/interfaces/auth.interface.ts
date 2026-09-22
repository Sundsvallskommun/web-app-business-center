import { User } from '@interfaces/users.interface';
import { Request } from 'express';
import { RepresentingEntity } from './representing.interface';
import { CaseStatusResponseWithPermissions } from '@/interfaces/case.interface';

export interface RequestWithUser extends Request {
  user: User;
  representing?: RepresentingEntity;
  cache?: {
    cases?: {
      PRIVATE?: CaseStatusResponseWithPermissions[];
      BUSINESS?: {
        [key: string]: CaseStatusResponseWithPermissions[];
      };
    };
  };
}
