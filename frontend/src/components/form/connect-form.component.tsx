import { FormControl, FormErrorMessage, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { Info } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export const ConnectForm = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

interface ConnectFormInputProps {
  name: string;
  header: React.ReactNode;
  children?: React.ReactNode | ((methods: ReturnType<typeof useFormContext>) => React.ReactElement);
  inputProps?: React.ComponentPropsWithRef<typeof Input.Component>;
}

export const ConnectFormInput: React.FC<ConnectFormInputProps> = ({ name, header, children, inputProps }) => {
  const methods = useFormContext();
  return (
    <FormControl id={name} className="w-full">
      {children && typeof children === 'function' ? (
        <>
          <FormLabel>{header}</FormLabel>
          {children({ ...methods })}
        </>
      ) : (
        <>
          <FormLabel>{header}</FormLabel>
          <Input {...methods.register(name)} {...inputProps} />
          {children}
        </>
      )}
      {methods.formState.errors?.[name]?.message ? (
        <div className="my-sm">
          <FormErrorMessage className="text-error flex flex-row">
            <Icon icon={<Info />} className="mr-5 shrink-0" size={16} />
            {(methods.formState.errors?.[name]?.message as string) ?? ''}
          </FormErrorMessage>
        </div>
      ) : null}
    </FormControl>
  );
};
