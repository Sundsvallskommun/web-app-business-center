import { User } from '@interfaces/users.interface';
import { Request } from 'express';
import { RepresentingEntity } from './representing.interface';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';

export interface RequestWithUser extends Request {
  user: User;
  representing?: RepresentingEntity;
  cache?: {
    cases?: {
      PRIVATE?: CaseStatusResponse[];
      BUSINESS?: {
        [key: string]: CaseStatusResponse[];
      };
    };
  };
}
