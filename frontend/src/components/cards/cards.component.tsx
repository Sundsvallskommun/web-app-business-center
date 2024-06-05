import { Button } from '@sk-web-gui/react';
import { useState } from 'react';

const defaultAmount = 12;

export const CardList: React.FC<{ data: object[]; Card: React.FC<{ item: object }> }> = ({ data, Card }) => {
  const [amountDisplayed, setAmountDisplayed] = useState(defaultAmount);

  const showMore = () => {
    setAmountDisplayed((amount) => (amount += defaultAmount));
  };

  const dataShown = data.slice(0, amountDisplayed);

  return (
    <section className="flex flex-col justify-center gap-y-[1.6rem]">
      {dataShown.map((item, index) => (
        <article key={`${index}`}>
          <Card item={item} />
        </article>
      ))}
      <div className="w-full flex justify-center">
        <div className="text-center">{`Visar ${dataShown.length} av ${data.length}`}</div>
      </div>

      {amountDisplayed < data.length && (
        <div className="w-full flex justify-center">
          <Button color="vattjom" onClick={showMore}>
            Visa fler
          </Button>
        </div>
      )}
    </section>
  );
};
