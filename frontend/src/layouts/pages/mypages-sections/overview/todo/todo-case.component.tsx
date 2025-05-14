import { ICaseStatusResponse } from '@interfaces/case';
import { Button, Icon } from '@sk-web-gui/react';
import { FilePen } from 'lucide-react';
import NextLink from 'next/link';
import styles from './todos.module.scss';

interface TodoCaseProps {
  data: ICaseStatusResponse;
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
        >{`Handläggaren har begärt kompletterade uppgifter på ditt ärende ${data.caseType}`}</p>
      </div>
      <div className={styles['todo-action']}>
        <NextLink href={`arenden/${data.caseId}`}>
          <Button className={styles['todo-action-button']} color="vattjom" aria-label={`${data.caseType}, till ärendet`}>
            Till ärendet
          </Button>
        </NextLink>
      </div>
    </div>
  );
};
