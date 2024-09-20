import { TodoCase } from '@components/mypages-sections/overview/todo/todo-case.component';
import { dataToTodo } from '@components/mypages-sections/overview/todo/utils';
import { CaseResponse, CasesData, ICase } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { casesHandler, getCasesInNeedOfData } from '@services/case-service';
import { Divider } from '@sk-web-gui/react';

export enum TodoType {
  CONTRACT,
  MESSAGE,
  CASE,
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

  return (
    <section>
      <h1>Att göra</h1>
      {casesIsFetching ? (
        <p>Laddar att göra</p>
      ) : todoCases.length < 1 ? (
        <p>Här finns inget att göra</p>
      ) : (
        <>
          <p>Här visas något som man kan skriva om här</p>
          <div className="mt-40">
            <Divider />
            {TodoItems.map((todo, index) => {
              let TodoComponent: React.ReactElement;
              switch (todo.type) {
                case TodoType.CASE:
                  TodoComponent = <TodoCase key={`${index}`} data={todo.data} />;
              }

              return (
                <>
                  {TodoComponent}
                  {index < TodoItems.length - 1 && <Divider />}
                </>
              );
            })}
            <Divider />
          </div>
        </>
      )}
    </section>
  );
};
