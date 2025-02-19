import { Button, Icon } from '@sk-web-gui/react';
import { FilePlus2 } from 'lucide-react';
import styles from './todos.module.scss';

export const TodoContract = () => {
  return (
    <div className={styles['todo']}>
      <div className={styles['todo-type']}>
        <Icon className={styles['todo-type-icon']} icon={<FilePlus2 />} />
      </div>
      <div className={styles['todo-content']}>
        <h2 className={styles['todo-content-heading']}>Förnya avtal X</h2>
        <p className={styles['todo-content-text']}>
          Ditt avtal går ut den <strong>27 april</strong> och behöver förnyas.
        </p>
      </div>
      <div className={styles['todo-action']}>
        <Button className={styles['todo-action-button']} color="vattjom" aria-label={`AVTAL, till avtalet`}>
          Till avtalet
        </Button>
      </div>
    </div>
  );
};
