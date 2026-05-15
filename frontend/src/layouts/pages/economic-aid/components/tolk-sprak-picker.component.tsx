import { Combobox, FormControl, FormErrorMessage, FormLabel } from '@sk-web-gui/react';
import { getLanguageOptions } from '@utils/languages';
import { useMemo } from 'react';

const RequiredMark: React.FC = () => (
  <span aria-hidden="true" className="text-error ml-4">
    *
  </span>
);

export interface TolkSprakPickerProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (next: string) => void;
  invalid: boolean;
  errorMessage?: string;
  dataCy?: string;
}

/**
 * Combobox med svenska språknamn för tolk-språks-fältet i ansökan om
 * ekonomiskt bistånd. Headless mot react-hook-form — caller äger
 * register/validate och skickar in värde + setter. Återanvänds av
 * sökandens tolk-fråga (steg 1) och medsökandens (steg 2).
 */
export const TolkSprakPicker: React.FC<TolkSprakPickerProps> = ({
  id,
  label,
  value,
  onValueChange,
  invalid,
  errorMessage,
  dataCy,
}) => {
  const options = useMemo(() => getLanguageOptions('sv'), []);

  return (
    <FormControl invalid={invalid} className="w-full">
      <FormLabel htmlFor={id}>
        {label}
        <RequiredMark />
      </FormLabel>
      <Combobox
        id={id}
        data-cy={dataCy}
        className="w-full"
        value={value}
        onChange={(event) => {
          const next = Array.isArray(event.target.value)
            ? (event.target.value[0] ?? '')
            : event.target.value;
          onValueChange(next);
        }}
        searchPlaceholder="Sök språk..."
        placeholder="Välj språk"
      >
        <Combobox.Input className="w-full" />
        <Combobox.List>
          {options.map((option) => (
            <Combobox.Option key={option.code} value={option.name}>
              {option.name}
            </Combobox.Option>
          ))}
        </Combobox.List>
      </Combobox>
      {errorMessage ? (
        <FormErrorMessage className="text-error">{errorMessage}</FormErrorMessage>
      ) : null}
    </FormControl>
  );
};
