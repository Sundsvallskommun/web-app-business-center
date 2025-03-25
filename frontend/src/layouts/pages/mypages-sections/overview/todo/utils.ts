import { TodoItem, TodoType } from './todos.component';

export function dataToTodo<TTodoType = TodoType>(
  data: TodoItem<TTodoType>['data'],
  type: TodoItem<TTodoType>['type']
): TodoItem<TTodoType> {
  return {
    type: type,
    data: data,
  };
}
