import { TodoItem, TodoType } from '@components/mypages-sections/overview/todo/todos.component';

export function dataToTodo<TTodoType = TodoType>(
  data: TodoItem<TTodoType>['data'],
  type: TodoItem<TTodoType>['type']
): TodoItem<TTodoType> {
  return {
    type: type,
    data: data,
  };
}
