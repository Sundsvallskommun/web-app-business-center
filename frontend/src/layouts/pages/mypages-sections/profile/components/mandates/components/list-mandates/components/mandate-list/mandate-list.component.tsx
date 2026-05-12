import { MandatePopulated } from '@interfaces/mandates';
import { MandateListItem } from './mandate-list-item.component';
import { useTranslation } from 'react-i18next';

interface MandateListProps extends React.ComponentPropsWithoutRef<'div'> {
  title: string;
  description: string;
  mandates?: MandatePopulated[];
}

export const MandateList: React.FC<MandateListProps> = ({ mandates, title, description, ...rest }) => {
  const { t } = useTranslation();

  return (
    <div {...rest}>
      <h3 className="text-large m-0">{title}</h3>
      <p className="mb-12">{description}</p>
      <ul className="flex flex-col gap-16">
        {mandates && mandates?.length > 0 ? (
          mandates?.map((mandate) => <MandateListItem key={mandate.id} mandate={mandate} />)
        ) : (
          <li className="italic">{t('profile:mandates.noMandates')}</li>
        )}
      </ul>
    </div>
  );
};
