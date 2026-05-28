import { getApiBase } from '@/config/api-config';
import ApiService from './api.service';
import { MUNICIPALITY_ID } from '@/config';
import { PortalPersonData } from '@/data-contracts/employee/data-contracts';
import { RequestWithUser } from '@/interfaces/auth.interface';

export const getUserData = async (adaccount: string, req: RequestWithUser): Promise<PortalPersonData> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('employee');
  const url = `${apiBase}/${MUNICIPALITY_ID}/portalpersondata/PERSONAL/${adaccount}`;
  const res = await apiService.get<PortalPersonData>(
    {
      url,
    },
    req.user,
  );
  return res.data;
};
