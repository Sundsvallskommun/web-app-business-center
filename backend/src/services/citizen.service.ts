import { getApiBase } from '@/config/api-config';
import ApiService from './api.service';
import { MUNICIPALITY_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { User } from '@/interfaces/users.interface';

export const getCitizen = async (partyId: string, req: { user: User }): Promise<CitizenExtended> => {
  const apiService = new ApiService();
  const citizenApiBase = getApiBase('citizen');
  const citizenUrl = `${citizenApiBase}/${MUNICIPALITY_ID}/${partyId}`;
  const citizenRes = await apiService.get<CitizenExtended>({ url: citizenUrl }, req.user).catch(() => null);

  if (!citizenRes?.data) {
    throw new HttpException(500, 'Could not fetch citizen data');
  }

  const citizen = citizenRes.data;
  return citizen;
};

export const getCitizenPersonnumber = async (partyId: string, req: { user: User }): Promise<CitizenExtended> => {
  const apiService = new ApiService();
  const citizenApiBase = getApiBase('citizen');
  const citizenUrl = `${citizenApiBase}/${MUNICIPALITY_ID}/${partyId}/personnumber`;
  const citizenRes = await apiService.get<CitizenExtended>({ url: citizenUrl }, req.user).catch(() => null);

  if (!citizenRes?.data) {
    throw new HttpException(500, 'Could not fetch citizen data');
  }

  const citizen = citizenRes.data;
  return citizen;
};
