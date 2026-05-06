import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './todos.module.scss';

export const TodoMessage = () => {
  const { t } = useTranslation('overview');

  return (
    <div className={styles['todo']}>
      <div className={styles['todo-type']}>
        <Icon className={styles['todo-type-icon']} icon={<Mail />} />
      </div>
      <div className={styles['todo-content']}>
        <h2 className={styles['todo-content-heading']}>{t('overview:todo.message.title')}</h2>
        <p className={styles['todo-content-text']}>
          {t('overview:todo.message.description')}
        </p>
      </div>
      <div className={styles['todo-action']}>
        <Button className={styles['todo-action-button']} color="vattjom" rightIcon={<ArrowRight />} aria-label={t('overview:todo.message.ariaLabel')}>
          {t('overview:todo.message.goToMessage')}
        </Button>
      </div>
    </div>
  );
};
