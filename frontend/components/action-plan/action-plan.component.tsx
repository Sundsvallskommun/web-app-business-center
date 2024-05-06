import { HelpTooltip } from '@components/tooltip/help-tooltip.component';
import { useLocalStorageValue } from '@react-hookz/web';
import { getCasePdf } from '@services/case-service';
import { deleteNote, getNotes, NotesData } from '@services/notes-service';
import { useMessage } from '@sk-web-gui/message';
import { Button, Link } from '@sk-web-gui/react';
import { ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/table';
import { useAppContext } from '@contexts/app.context';
import dayjs from 'dayjs';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { deleteReminder, getReminders, ReminderFormModel, RemindersData } from '../../services/reminder-service';
import ActionModal from '../action-modal/action-modal.component';
import { CasesComponent } from '../cases-component/cases-component';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

export const ActionPlan: React.FC<{ reminders: RemindersData; notes: NotesData }> = (props) => {
  const [labels, setLabels] = useState([]);
  const [remindersItems, setRemindersItems] = useState<ReminderFormModel[]>([]);
  const { setNotes, setReminders, isLoadingReminders } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeReminder, setActiveReminder] = useState<ReminderFormModel>();
  const [activeReminderElement, setActiveReminderElement] = useState<HTMLAnchorElement>();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>(null);

  const [pageSize] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const defaultSort = { idx: 1, sortMode: false };

  const localstorageKey = 'action-plan-component';
  const { value: disclosureIsOpen, set: setDisclosureIsOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: false,
    initializeWithValue: true,
  });

  const message = useMessage();

  const closeModal = () => {
    setIsOpen(false);
    activeReminderElement.focus();
  };

  const openEditModal = (reminder) => {
    setActiveReminder(JSON.parse(JSON.stringify(reminder))); // New reference copy
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleDeleteReminder = async (reminder) => {
    const shouldRemove = await window.confirm('Är du säker att du vill ta bort påminnelsen?');
    if (!shouldRemove) return;
    let apiCall;
    let getData;
    let setData;
    if (reminder.isReminder) {
      apiCall = deleteReminder;
      getData = getReminders;
      setData = setReminders;
    } else {
      // is note
      apiCall = deleteNote;
      getData = getNotes;
      setData = setNotes;
    }

    apiCall(reminder.id).then((success) => {
      if (success) {
        getData().then(setData);
      } else {
        message({
          message: 'Det gick inte att ta bort påminnelsen',
          status: 'error',
        });
      }
    });
  };

  const getPdf = (caseId: string) => {
    setIsLoading((old) => {
      const newObj = { ...old };
      newObj[caseId] = true;
      return newObj;
    });
    getCasePdf(caseId)
      .then((d) => {
        if (typeof d.error === 'undefined') {
          const uri = `data:application/pdf;base64,${d.pdf.base64}`;
          const link = document.createElement('a');
          link.href = uri;
          link.setAttribute('download', `${caseId}.pdf`);
          document.body.appendChild(link);
          link.click();
        } else {
          message({
            message: 'Det gick inte att hämta filen.',
            status: 'error',
          });
        }
      })
      .finally(() => {
        setIsLoading((old) => {
          const newObj = { ...old };
          newObj[caseId] = false;
          return newObj;
        });
      });
  };

  const sortHandler = useCallback((sortColumn: number, sortAscending: boolean) => {
    const asc = sortAscending ? 1 : -1;
    setRemindersItems((rems) => [
      ...rems.sort((itemA: ReminderFormModel, itemB: ReminderFormModel) => {
        switch (sortColumn) {
          case 0:
            return itemA.heading.toLowerCase() > itemB.heading.toLowerCase()
              ? asc
              : itemA.heading.toLowerCase() < itemB.heading.toLowerCase()
              ? -1 * asc
              : 0;
          case 1:
            return itemA.modified > itemB.modified ? asc : itemA.modified < itemB.modified ? -1 * asc : 0;
          case 2:
            return itemA.createdBy.toLowerCase() > itemB.createdBy.toLowerCase()
              ? asc
              : itemA.createdBy.toLowerCase() < itemB.createdBy.toLowerCase()
              ? -1 * asc
              : 0;
          case 3:
            return itemA.note.toLowerCase() > itemB.note.toLowerCase()
              ? asc
              : itemA.note.toLowerCase() < itemB.note.toLowerCase()
              ? -1 * asc
              : 0;
          default:
            return asc;
        }
      }),
    ]);
  }, []);
  const headers: ZebraTableHeader[] = labels?.map((l, idx) => ({
    element: (
      <span key={`mh${idx}`} className="font-bold">
        {l.label}
      </span>
    ),
    isShown: true,
    isColumnSortable: l.sortable,
    screenReaderOnly: l.screenReaderOnly,
  }));
  const rows: ZebraTableColumn[][] = remindersItems?.map((r, idx) => {
    return [
      {
        element: (
          <Fragment key={`mr${idx}`}>
            <div className="lg:w-[30rem] xl:w-[44rem]">
              <div className="inline-flex lg:-ml-3 ">
                <span className="p-2 hidden lg:flex lg:items-center mr-sm">
                  {
                    <Button
                      rounded={true}
                      variant="outline"
                      className="p-sm border-none"
                      aria-label={`Ta bort påminnelse: ${r.heading}`}
                      onClick={(e: React.BaseSyntheticEvent) => {
                        e.preventDefault();
                        handleDeleteReminder(r);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon className="material-icon !text-2xl" aria-hidden="true" />
                    </Button>
                  }
                </span>
                <div className="flex items-center flex-wrap ">
                  <div className="w-full flex items-center">
                    <span className="p-2 lg:hidden">
                      {
                        <Button
                          rounded={true}
                          variant="outline"
                          className="p-sm border-none"
                          aria-label={`Ta bort påminnelse: ${r.heading}`}
                          onClick={(e: React.BaseSyntheticEvent) => {
                            e.preventDefault();
                            handleDeleteReminder(r);
                          }}
                        >
                          <DeleteOutlineOutlinedIcon className="material-icon !text-2xl" aria-hidden="true" />
                        </Button>
                      }
                    </span>
                    <button
                      onClick={(e: React.BaseSyntheticEvent) => {
                        e.preventDefault();
                        setActiveReminderElement(e.target);
                        openEditModal(r);
                      }}
                    >
                      <Link as="span">
                        <strong>{r.heading || r.caseId}</strong>
                      </Link>
                    </button>
                  </div>
                  <div>
                    <small>
                      <span className="pr-md">{r.caseId}</span>
                      {r.isReminder && <SendOutlinedIcon className="material-icon mr-sm align-text-bottom" />}
                      <span className="pr-md">
                        {r.isReminder ? (
                          <>
                            {dayjs(r.reminderDate).isBefore(dayjs(new Date())) ? 'Skickades: ' : 'Skickas: '}
                            {dayjs(r.reminderDate).format('YYYY-MM-DD')}
                          </>
                        ) : (
                          <>
                            {'Skapad: '}
                            {dayjs(r.created).format('YYYY-MM-DD')}
                          </>
                        )}
                      </span>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        ),
        isShown: true,
      },
      {
        element: (
          <Fragment key={`mr${idx}`}>
            <span className="inline lg:hidden">Senast ändrat: </span>
            <span className="font-bold lg:font-normal block xl:w-[14rem]">{r.modified}</span>
          </Fragment>
        ),
        isShown: true,
      },
      {
        element: (
          <Fragment key={`mr${idx}`}>
            <span>
              <span className="lg:hidden">Skapad av: </span>
              <span className="font-bold lg:font-normal block xl:w-[20rem]">{r.createdBy}</span>
            </span>
          </Fragment>
        ),
        isShown: true,
      },
      {
        element: (
          <Fragment key={`mr${idx}`}>
            <span>
              <span className="lg:hidden">Anteckning: </span>
              <span className="font-bold lg:font-normal block xl:w-[30rem]">{r.note}</span>
            </span>
          </Fragment>
        ),
        isShown: true,
      },
      {
        element: (
          <Button
            aria-label={`Hämta PDF för ärende ${r.caseId}`}
            key={`mr${idx}`}
            variant="solid"
            color="primary"
            loading={isLoading?.[r.externalCaseId]}
            loadingText="Hämtar"
            className="w-full lg:w-auto px-md"
            onClick={() => getPdf(r.externalCaseId)}
          >
            Hämta PDF <FileDownloadOutlinedIcon className="material-icon ml-sm" />
          </Button>
        ),
        isShown: true,
      },
    ];
  });
  const table = (
    <>
      {props.reminders.error == '404' && props.notes.error == '404' ? (
        <p className="px-lg w-3/5">Det finns inga påminnelser inlagda</p>
      ) : rows?.length > 0 ? (
        <></>
      ) : isLoadingReminders ? (
        <p className="px-lg w-3/5">Laddar påminnelser</p>
      ) : (
        <p className="px-lg w-3/5">Det gick inte att hämta påminnelser</p>
      )}
      <ZebraTable
        changePage={(page) => setPage(page)}
        page={page}
        pages={Math.ceil(rows.length / pageSize)}
        pageSize={pageSize}
        headers={headers}
        rows={rows}
        defaultSort={defaultSort}
        tableSortable={true}
        sortHandler={sortHandler}
        BottomComponent={
          <HelpTooltip
            ariaLabel={'Hjälptext'}
          >{`Här kan du själv ställa in en påminnelse om att du behöver göra något, till exempel söka om ett tillstånd, eller göra en beställning eller anmälan.`}</HelpTooltip>
        }
      />
    </>
  );

  useEffect(() => {
    setLabels([...props.reminders?.labels, ...props.notes?.labels]);
    setRemindersItems([...props.reminders.reminders, ...(props.notes.notes as unknown as ReminderFormModel[])]);
    sortHandler(defaultSort.idx, defaultSort.sortMode);
  }, [props.reminders, props.notes, sortHandler, defaultSort.idx, defaultSort.sortMode]);

  return (
    <>
      <CasesComponent
        header={
          <>
            {isLoadingReminders ? (
              <span>Laddar påminnelser</span>
            ) : (
              <span>Egna påminnelser ({remindersItems.length})</span>
            )}
          </>
        }
        helpText={`Här kan du själv ställa in en påminnelse om att du behöver göra något, till exempel söka om ett tillstånd, eller göra en beställning eller anmälan.`}
        disclosureIsOpen={disclosureIsOpen}
        setDisclosureIsOpenCallback={(open) => setDisclosureIsOpen(open)}
      >
        {table}
      </CasesComponent>
      <ActionModal isOpen={isOpen} isEdit={isEdit} closeModal={closeModal} reminder={activeReminder} />
    </>
  );
};
