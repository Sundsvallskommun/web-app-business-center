import { ICaseStatusResponse } from '@interfaces/case';
import { Button, Icon } from '@sk-web-gui/react';
import { getCaseTypeLabel } from '@utils/casetype-label-mapper';
import { ArrowRight, FilePen } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './todos.module.scss';

interface TodoCaseProps {
  data: ICaseStatusResponse;
}

export const TodoCase = ({ data }: TodoCaseProps) => {
  const { t } = useTranslation('overview');

  return (
    <div className={styles['todo']}>
      <div className={styles['todo-main']}>
        <div className={styles['todo-type']}>
          <Icon className={styles['todo-type-icon']} icon={<FilePen />} />
        </div>
        <div className={styles['todo-content']}>
          <h2 className={styles['todo-content-heading']}>{t('overview:todo.complementNeeded', { caseId: data.errandNumber })}</h2>
          <p className={styles['todo-content-text']}>
            {t('overview:todo.complementDescription')}
          </p>
        </div>
      </div>
      <div className={styles['todo-action']}>
        <NextLink href={`arenden/${data.caseId}`}>
          <Button
            className={styles['todo-action-button']}
            color="vattjom"
            rightIcon={<ArrowRight />}
            aria-label={`${getCaseTypeLabel(data.caseType)}, till ärendet`}
          >
            {t('overview:todo.goToCase')}
          </Button>
        </NextLink>
      </div>
    </div>
  );
};
