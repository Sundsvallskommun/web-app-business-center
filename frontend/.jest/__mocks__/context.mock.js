import * as AppContext from '@contexts/app.context';
import { representingEntity } from './data.mock.js';

export const contextValues = {
  representingEntity: representingEntity,
  setRepresentingEntity: jest.fn(),
};

jest.spyOn(AppContext, 'useAppContext').mockImplementation(() => contextValues);
