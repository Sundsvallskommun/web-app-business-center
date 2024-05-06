import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { Button } from '@sk-web-gui/react';
import Link from 'next/link';
import { OrganisationInfo } from '../../interfaces/organisation-info';
import { User } from '@interfaces/user';
import { emptyOrganisationInfo } from '../../services/organisation-service';
import { emptyUser } from '../../services/user-service';

export const InformationSection: React.FC<{ orgInfo: OrganisationInfo; user: User }> = ({
  orgInfo = emptyOrganisationInfo,
  user = emptyUser,
}) => {
  return (
    <div className="container m-auto px-0 text-content">
      <h1 className="text-xl hidden lg:block">Företagsuppgifter</h1>
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 justify-start">
        <div>
          <strong>{orgInfo.orgName}</strong>
          <div>
            <strong>Inloggad som:</strong> {user.name}
          </div>
        </div>
        <div>
          <strong>Organisationsnummer:</strong>
          <div>{orgInfo.orgNumber}</div>
        </div>
        {orgInfo?.information?.companyLocation?.address?.street && (
          <div>
            <div>
              <strong>Besöksadress:</strong>
            </div>
            <span>{orgInfo.information.companyLocation?.address?.street}</span>
            {', '}
            <span>{orgInfo.information.companyLocation?.address?.postcode}</span>{' '}
            <span>{orgInfo.information.companyLocation?.address?.city}</span>
          </div>
        )}
      </div>

      <div className="mt-xl">
        <h2 className="text-base md:text-lg">Byt företag att se uppgifter om</h2>
        <Link href={`/valj-foretag`}>
          <Button
            className="w-full md:w-auto mt-md"
            color="primary"
            variant="solid"
            size="lg"
            leftIcon={<BusinessOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />}
          >
            Byt företag
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InformationSection;
