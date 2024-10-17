import { TodoCase } from '@components/mypages-sections/overview/todo/todo-case.component';
import { CaseResponse, CasesData, ICase } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, getCasesInNeedOfData } from '@services/case-service';
import { Divider, useThemeQueries } from '@sk-web-gui/react';
import { Fragment } from 'react';
import styles from './todos.module.scss';

export enum TodoType {
  CONTRACT,
  MESSAGE,
  CASE,
}

export function dataToTodo<TTodoType = TodoType>(
  data: TodoItem<TTodoType>['data'],
  type: TodoItem<TTodoType>['type']
): TodoItem<TTodoType> {
  return {
    type: type,
    data: data,
  };
}

export interface TodoItem<TTodoType = TodoType> {
  type: TTodoType;
  data: TTodoType extends TodoType.CASE ? ICase : object;
}

export const Todos = () => {
  const { data: cases, isFetching: casesIsFetching } = useApi<CaseResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
  });
  const todoCases: TodoItem<TodoType.CASE>[] = cases
    ? getCasesInNeedOfData(cases)?.cases.map((data) => dataToTodo<TodoType.CASE>(data, TodoType.CASE))
    : [];
  const TodoItems = [...todoCases];
  const { isMinDesktop } = useThemeQueries();

  return (
    <section>
      <h1>Att göra</h1>
      <p className="text-lead">Här visas något som man kan skriva om här.</p>
      <div className={styles['todos']}>
        {casesIsFetching ? (
          <p className="text-secondary">Laddar att göra</p>
        ) : todoCases.length < 1 ? (
          <p className="text-secondary">Här finns inget att göra</p>
        ) : (
          <>
            {isMinDesktop && <Divider />}
            {TodoItems.map((todo, index) => {
              let TodoComponent: React.ReactElement;
              switch (todo.type) {
                case TodoType.CASE:
                  TodoComponent = <TodoCase data={todo.data} />;
              }

              return (
                <Fragment key={`${index}`}>
                  {TodoComponent}
                  {index < TodoItems.length - 1 && isMinDesktop && <Divider />}
                </Fragment>
              );
            })}
            {isMinDesktop && <Divider />}
          </>
        )}
      </div>
    </section>
  );
};
