import { Button } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';

export const CardList: React.FC<{
  data: object[];
  Card: React.FC<{ item: object }>;
  amountDisplayed?: number;
  showAmountString?: boolean;
}> = ({ data, Card, amountDisplayed: _amountDisplayed = 12, showAmountString = true }) => {
  const [amountDisplayed, setAmountDisplayed] = useState(_amountDisplayed);
  const [dataShown, setDataShown] = useState(data.slice(0, amountDisplayed));

  const showMore = () => {
    setAmountDisplayed((amount) => (amount += amountDisplayed));
  };

  useEffect(() => {
    setAmountDisplayed(_amountDisplayed);
    setDataShown(data.slice(0, _amountDisplayed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, _amountDisplayed]);

  return (
    <section className="flex flex-col justify-center gap-y-[1.6rem]">
      {dataShown.map((item, index) => (
        <article key={`${index}`}>
          <Card item={item} />
        </article>
      ))}
      {showAmountString ? (
        <div className="w-full flex justify-center">
          <div className="text-center">{`Visar ${dataShown.length} av ${data.length}`}</div>
        </div>
      ) : null}

      {amountDisplayed < data.length && (
        <div className="w-full flex justify-center">
          <Button size="lg" color="vattjom" onClick={showMore}>
            Visa fler
          </Button>
        </div>
      )}
    </section>
  );
};
