import { useEffect, useMemo } from 'react';
import { DefaultValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form';

interface FormLogicProps<T extends object> {
  children: React.ReactNode | React.ReactNode[];
  formData: DefaultValues<T>;
  onSubmit: (values: T, context: UseFormReturn<T>) => void;
}

export default function FormLogic<T extends object>({ children, formData, onSubmit }: FormLogicProps<T>) {
  const context = useForm<T>({
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });

  const { handleSubmit, reset } = context;

  const _onSubmit = async (values: T) => {
    if (onSubmit) {
      onSubmit(values, context);
    }
  };

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  return (
    <FormProvider {...context}>
      <form onSubmit={handleSubmit(_onSubmit)}>{children}</form>
    </FormProvider>
  );
}
