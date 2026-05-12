import { MandatePopulated } from 'src/data-contracts/backend/data-contracts';
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
