import { Button, LucideIcon } from '@sk-web-gui/react';
import styles from './todos.module.scss';

export const TodoMessage = () => {
  return (
    <div className={styles['todo']}>
      <div className={styles['todo-type']}>
        <LucideIcon className={styles['todo-type-icon']} name="mail" />
      </div>
      <div className={styles['todo-content']}>
        <h2 className={styles['todo-content-heading']}>Nytt meddelande på ärende X</h2>
        <p className={styles['todo-content-text']}>
          Du har ett nytt meddelande på ditt ärende Bygglov - Komplementbyggnad #X
        </p>
      </div>
      <div className={styles['todo-action']}>
        <Button className={styles['todo-action-button']} color="vattjom" aria-label={`MEDDELANDE, till meddelandet`}>
          Till meddelandet
        </Button>
      </div>
    </div>
  );
};
