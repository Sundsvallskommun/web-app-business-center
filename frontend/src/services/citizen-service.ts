import { useEffect, useState } from 'react';
import { apiService, ApiResponse } from './api-service';
import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export interface Citizen {
  personId: string;
  givenname: string;
  lastname: string;
}

interface CitizenApiResponse {
  data: Citizen;
  message: string;
}

const getCitizen = (personnumber: string) => {
  return apiService.post<CitizenApiResponse>('/citizen', { personnumber });
};

export const useCitizen = (personnumber?: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [data, setData] = useState<Citizen | null>(null);
  const message = useSnackbar();
  const { t } = useTranslation();

  useEffect(() => {
    setData(null);
    setLoaded(false);
    if (personnumber?.length === 12) {
      setLoading(true);

      getCitizen(personnumber)
        .then((res) => {
          setData(res.data.data);
          setLoaded(true);
        })
        .catch(() => {
          message({ message: t('common:citizenError'), status: 'warning' });
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personnumber]);

  return { loading, loaded, data };
};
