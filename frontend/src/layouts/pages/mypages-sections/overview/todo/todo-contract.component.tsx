import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight, FilePlus2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './todos.module.scss';

export const TodoContract = () => {
  const { t } = useTranslation('overview');

  return (
    <div className={styles['todo']}>
      <div className={styles['todo-type']}>
        <Icon className={styles['todo-type-icon']} icon={<FilePlus2 />} />
      </div>
      <div className={styles['todo-content']}>
        <h2 className={styles['todo-content-heading']}>{t('overview:todo.contract.title')}</h2>
        <p className={styles['todo-content-text']}>
          {t('overview:todo.contract.description')}
        </p>
      </div>
      <div className={styles['todo-action']}>
        <Button className={styles['todo-action-button']} color="vattjom" rightIcon={<ArrowRight />} aria-label={t('overview:todo.contract.ariaLabel')}>
          {t('overview:todo.contract.goToContract')}
        </Button>
      </div>
    </div>
  );
};
