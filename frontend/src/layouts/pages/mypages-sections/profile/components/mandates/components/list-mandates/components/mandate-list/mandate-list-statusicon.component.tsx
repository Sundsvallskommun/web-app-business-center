import { MandatePopulated } from '@interfaces/mandates';
import { CaptionsOff, Clock10, Trash } from 'lucide-react';

export const MandateListStatusIcon: React.FC<{ status: MandatePopulated['status'] }> = ({ status }) => {
  switch (status) {
    case 'DELETED':
      return <Trash />;
    case 'EXPIRED':
      return <Clock10 />;
    default:
      return <CaptionsOff />;
  }
};
