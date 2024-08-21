import { FormLabel, Input } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { ConnectFormInput } from './connect-form.component';

export const FormBox: React.FC<{
  header: React.ReactNode;
  children: React.ReactNode;
  name?: string;
  isEdit?: boolean;
  input?: React.ReactNode | ((methods: ReturnType<typeof useFormContext>) => React.ReactElement);
  inputProps?: React.ComponentPropsWithRef<typeof Input.Component>;
}> = ({ header, children, name, isEdit, input, inputProps }) => {
  return (
    <div className="max-w-[29.6rem] basis-[29.6rem] flex flex-col">
      {name && isEdit ? (
        <ConnectFormInput name={name} header={header} inputProps={inputProps}>
          {input}
        </ConnectFormInput>
      ) : (
        <FormLabel className="font-normal">
          <div className="font-bold mb-8">{header}</div>
          <div>{children}</div>
        </FormLabel>
      )}
    </div>
  );
};
