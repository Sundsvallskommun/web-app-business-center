import { Button } from '@sk-web-gui/react';
import { useCallback, useEffect, useState } from 'react';

export const CardList: React.FC<
  {
    data: object[];
    Card: React.FC<{ item: object }>;
    amountDisplayed?: number;
    showAmountString?: boolean;
    showMoreText?: string;
  } & React.ComponentPropsWithRef<'ul'>
> = (props) => {
  const {
    data,
    Card,
    amountDisplayed: _amountDisplayed = 12,
    showAmountString = true,
    showMoreText = 'Visa fler',
    ...rest
  } = props;
  const [amountDisplayed, setAmountDisplayed] = useState(_amountDisplayed);
  const [dataShown, setDataShown] = useState(data.slice(0, amountDisplayed));

  const showMore = useCallback(() => {
    const _amountDisplayed = amountDisplayed + 12;
    setAmountDisplayed(_amountDisplayed);
    setDataShown(data.slice(0, _amountDisplayed));
  }, [amountDisplayed, data]);

  useEffect(() => {
    setAmountDisplayed(_amountDisplayed);
    setDataShown(data.slice(0, _amountDisplayed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, _amountDisplayed]);

  return (
    <ul className="flex flex-col justify-center gap-y-[1.6rem]" {...rest}>
      {dataShown.map((item, index) => (
        <li key={`${index}`}>
          <Card item={item} />
        </li>
      ))}
      {showAmountString ? (
        <div className="w-full flex justify-center mt-8">
          <div className="text-center">{`Visar ${dataShown.length} av ${data.length}`}</div>
        </div>
      ) : null}

      {amountDisplayed < data.length && (
        <div className="w-full flex justify-center">
          <Button variant="secondary" size="lg" color="vattjom" onClick={showMore}>
            {showMoreText}
          </Button>
        </div>
      )}
    </ul>
  );
};
