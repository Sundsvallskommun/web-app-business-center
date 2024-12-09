import { ICase } from '@interfaces/case';
import { Button, Icon } from '@sk-web-gui/react';
import { FilePen } from 'lucide-react';
import styles from './todos.module.scss';

interface TodoCaseProps {
  data: ICase;
}

export const TodoCase = ({ data }: TodoCaseProps) => {
  return (
    <div className={styles['todo']}>
      <div className={styles['todo-type']}>
        <Icon className={styles['todo-type-icon']} icon={<FilePen />} />
      </div>
      <div className={styles['todo-content']}>
        <h2 className={styles['todo-content-heading']}>{`Komplettering behövs på ärende #${data.caseId}`}</h2>
        <p
          className={styles['todo-content-text']}
        >{`Handläggaren har begärt kompletterade uppgifter på ditt ärende ${data.subject.caseType}`}</p>
      </div>
      <div className={styles['todo-action']}>
        <Button
          className={styles['todo-action-button']}
          color="vattjom"
          aria-label={`${data.subject.caseType}, till ärendet`}
        >
          Till ärendet
        </Button>
      </div>
    </div>
  );
};
