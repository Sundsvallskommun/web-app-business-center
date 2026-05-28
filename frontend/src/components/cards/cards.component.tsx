import { Button } from '@sk-web-gui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PAGESIZE = 24;

export const CardList = <T extends object>(
  props: {
    data: T[];
    Card: React.FC<{ item: T }>;
    amountDisplayed?: number;
    showAmountString?: boolean;
    showMoreText?: string;
    showLessText?: string;
    persistKey?: string;
  } & React.ComponentPropsWithRef<'ul'>
): React.ReactElement => {
  const {
    data,
    Card,
    amountDisplayed: _amountDisplayed = PAGESIZE,
    showAmountString = true,
    showMoreText = 'Visa fler',
    showLessText = 'Visa färre',
    persistKey,
    ...rest
  } = props;
  const [amountDisplayed, setAmountDisplayed] = useState(_amountDisplayed);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;

    const storedValue = window.localStorage.getItem(persistKey);
    if (!storedValue) return;

    const parsed = Number.parseInt(storedValue, 10);
    if (Number.isNaN(parsed)) return;

    setAmountDisplayed((prev) => {
      const next = Math.max(parsed, _amountDisplayed);
      return next === prev ? prev : next;
    });
  }, [persistKey, _amountDisplayed]);

  useEffect(() => {
    setAmountDisplayed((prev) => (prev < _amountDisplayed ? _amountDisplayed : prev));
  }, [_amountDisplayed]);

  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    window.localStorage.setItem(persistKey, amountDisplayed.toString());
  }, [amountDisplayed, persistKey]);

  const showMore = useCallback(() => {
    setAmountDisplayed((prev) => prev + PAGESIZE);
  }, []);

  const showLess = useCallback(() => {
    setAmountDisplayed(_amountDisplayed);
  }, [_amountDisplayed]);

  const dataShown = useMemo(() => data.slice(0, amountDisplayed), [data, amountDisplayed]);

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

      {(amountDisplayed < data.length || amountDisplayed > _amountDisplayed) && (
        <div className="w-full flex flex-wrap justify-center gap-4">
          {amountDisplayed > _amountDisplayed ? (
            <Button variant="secondary" size="lg" color="vattjom" onClick={showLess}>
              {showLessText}
            </Button>
          ) : null}
          {amountDisplayed < data.length ? (
            <Button variant="secondary" size="lg" color="vattjom" onClick={showMore}>
              {showMoreText}
            </Button>
          ) : null}
        </div>
      )}
    </ul>
  );
};
