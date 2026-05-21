'use client';

import { Asset } from '@data-contracts/partyassets/data-contracts';
import { CaseStatusResponse } from '@data-contracts/casestatus/data-contracts';
import { CasesData, ICaseStatusResponse } from '@interfaces/case';
import { useApi } from '@services/api-service';
import { isParkingPermit, soonExpiring } from '@services/asset-service';
import { useParkingPermits } from '@services/featureflag-service';
import { casesHandler, getCasesInNeedOfData } from '@services/case-service';
import { Divider, Spinner, useThemeQueries } from '@sk-web-gui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { TodoCase } from './todo-case.component';
import { TodoParkingPermitExpiry } from './todo-parking-permit-expiry.component';
import styles from './todos.module.scss';

export enum TodoType {
  CONTRACT,
  MESSAGE,
  CASE,
  PARKING_PERMIT_EXPIRY,
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
  data: TTodoType extends TodoType.CASE
    ? ICaseStatusResponse
    : TTodoType extends TodoType.PARKING_PERMIT_EXPIRY
      ? Asset
      : object;
}

export const Todos = () => {
  const { t } = useTranslation('overview');

  const { data: cases, isFetching: casesIsFetching } = useApi<CaseStatusResponse, Error, CasesData>({
    url: '/cases',
    method: 'get',
    dataHandler: casesHandler,
    queryKey: ['cases'],
  });

  const { data: assets, isFetching: assetsIsFetching } = useApi<Asset[]>({
    url: '/assets',
    method: 'get',
  });

  const todoCases: TodoItem<TodoType.CASE>[] = cases
    ? getCasesInNeedOfData(cases)?.cases.map((data) => dataToTodo<TodoType.CASE>(data, TodoType.CASE))
    : [];

  const todoPermitExpiry: TodoItem<TodoType.PARKING_PERMIT_EXPIRY>[] =
    useParkingPermits && assets
      ? assets
          .filter((asset) => isParkingPermit(asset) && soonExpiring(asset))
          .map((asset) => dataToTodo<TodoType.PARKING_PERMIT_EXPIRY>(asset, TodoType.PARKING_PERMIT_EXPIRY))
      : [];

  const todoItems = [...todoCases, ...todoPermitExpiry];
  const { isMinDesktop } = useThemeQueries();

  return (
    <section>
      <h1>{t('overview:todo.title')}</h1>
      <p className="text-lead">{t('overview:todo.description')}</p>
      <div className={styles['todos']}>
        {casesIsFetching || assetsIsFetching ? (
          <div className="flex items-center">
            <p className="text-secondary">{t('overview:todo.fetching')}</p>
            <Spinner className="ml-10" size={2} />
          </div>
        ) : todoItems.length < 1 ? (
          <p className="text-secondary">{t('overview:todo.noTodos')}</p>
        ) : (
          <>
            {isMinDesktop && <Divider />}
            {todoItems.map((todo, index) => {
              let TodoComponent: React.ReactElement;
              switch (todo.type) {
                case TodoType.CASE:
                  TodoComponent = <TodoCase data={todo.data} />;
                  break;
                case TodoType.PARKING_PERMIT_EXPIRY:
                  TodoComponent = <TodoParkingPermitExpiry asset={todo.data as Asset} />;
                  break;
              }

              return (
                <Fragment key={`${index}`}>
                  {TodoComponent}
                  {index < todoItems.length - 1 && isMinDesktop && <Divider />}
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
