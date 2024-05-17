import { CasesComponent } from '@components/cases-component/cases-component';
import { useAppContext } from '@contexts/app.context';
import { CasesData } from '@interfaces/case';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useLocalStorageValue } from '@react-hookz/web';
import { getCasePdf } from '@services/case-service';
import { AutoTable, AutoTableHeader, Badge, Button, useSnackbar } from '@sk-web-gui/react';
import { statusColorMap } from '@utils/status-color';
import _ from 'lodash';
import { Fragment, useEffect, useRef, useState } from 'react';

export const OngoingCases: React.FC<{ ongoing: CasesData }> = (props) => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>(null);
  const message = useSnackbar();
  const ref = useRef<null | HTMLDivElement>(null);

  const localstorageKey = 'ongoing-cases-component';
  const { value: disclosureIsOpen, set: setDisclosureIsOpen } = useLocalStorageValue(localstorageKey, {
    defaultValue: false,
    initializeWithValue: true,
  });
  const { highlightedTableRow, setHighlightedTableRow, isLoadingCases } = useAppContext();
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number>();
  const [timeoutRef, setTimeoutRef] = useState<string | number | NodeJS.Timeout>();

  useEffect(() => {
    if (!_.isEmpty(highlightedTableRow)) {
      const itemIndex = props.ongoing?.cases?.findIndex(
        (item) => item[highlightedTableRow.property] === highlightedTableRow.value
      );
      if (itemIndex !== -1) {
        setHighlightedItemIndex(itemIndex);
        ref.current.scrollIntoView({ behavior: 'smooth' });
        if (!disclosureIsOpen) {
          setDisclosureIsOpen(true);
        }
        if (timeoutRef) clearTimeout(timeoutRef);
        setTimeoutRef(
          setTimeout(() => {
            setHighlightedTableRow({});
            setHighlightedItemIndex(undefined);
          }, 20000)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedTableRow, props.ongoing?.cases]);

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

  const headers: Array<AutoTableHeader | string> = [
    {
      label: 'Ärende',
      sticky: true,
      property: 'subject.caseType',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Fragment>
            <div>
              <strong className="block lg:w-[30rem] xl:w-[44rem]">{value}</strong>
            </div>
            <div>
              <small>
                <span className="pr-md">{item.caseId}</span>
              </small>
            </div>
          </Fragment>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Senast ändrad',
      sticky: false,
      property: 'subject.meta.modified',
      screenReaderOnly: false,
      isColumnSortable: true,
    },
    {
      label: 'Status',
      sticky: false,
      property: 'status.label',
      screenReaderOnly: false,
      renderColumn: (value, item) => (
        <div className="text-left">
          <Fragment>
            <span className="flex items-center xl:w-[20rem]">
              <Badge
                size="sm"
                variant="solid"
                className={`w-[14px] max-h-[14px] h-[14px] bg-${statusColorMap(item.status.color)} mr-2`}
              />
              {value}
            </span>
          </Fragment>
        </div>
      ),
      isColumnSortable: true,
    },
    {
      label: 'Ärendeknapp',
      sticky: false,
      screenReaderOnly: true,
      renderColumn: (value, item) => (
        <div className="text-right w-full">
          <Button
            aria-label={`Hämta PDF för ärende ${item.caseId}`}
            variant="solid"
            color="primary"
            loading={isLoading?.[item.externalCaseId]}
            loadingText="Hämtar"
            className="w-full lg:w-auto px-md"
            onClick={() => getPdf(item.externalCaseId)}
          >
            Hämta PDF <FileDownloadOutlinedIcon className="material-icon ml-sm" aria-hidden="true" />
          </Button>
        </div>
      ),
      isColumnSortable: false,
    },
  ];

  const table = (
    <>
      {props.ongoing?.cases?.length === 0 && !isLoadingCases ? (
        <p className="px-lg w-3/5">Det finns inga pågående ärenden</p>
      ) : props.ongoing?.cases?.length > 0 ? (
        <></>
      ) : (
        isLoadingCases && <p className="px-lg w-3/5">Laddar pågående ärenden</p>
      )}
      {props.ongoing?.cases?.length > 0 && (
        <div className="px-lg">
          <AutoTable autodata={props.ongoing?.cases} autoheaders={headers} />
        </div>
      )}
    </>
  );

  return (
    <div ref={ref}>
      <CasesComponent
        header={
          <>
            {isLoadingCases ? (
              <span>Laddar pågående ärenden</span>
            ) : (
              <span>Pågående ärenden ({props.ongoing?.cases?.length})</span>
            )}
          </>
        }
        helpText={`Här hittar du ärenden som vi handlägger just nu. Du kan inte förändra eller uppdatera ärenden på den här sidan.`}
        disclosureIsOpen={disclosureIsOpen}
        setDisclosureIsOpenCallback={(open) => setDisclosureIsOpen(open)}
      >
        {table}
      </CasesComponent>
    </div>
  );
};
