import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from '@sk-web-gui/react';
import { useEffect, useMemo } from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import * as yup from 'yup';

interface ContactDetailForm {
  email?: string | null;
  phone?: string | null;
}

const emptyContactDetailForm: ContactDetailForm = {
  email: '',
  phone: '',
};

interface ContactDetailFormLogicProps {
  children: React.ReactNode | React.ReactNode[];
  formData?: ContactDetailForm;
  onSubmit?: (values: ContactDetailForm, context: UseFormReturn<ContactDetailForm, unknown, undefined>) => void;
}

let formSchema = yup
  .object({
    phone: yup.string().nullable(),
    email: yup.string().email('E-postadress har fel format').nullable(),
  })
  .required();

export default function ContactDetailFormLogic({
  children,
  formData = emptyContactDetailForm,
  onSubmit,
}: ContactDetailFormLogicProps) {
  const snackBar = useSnackbar();

  const context = useForm<ContactDetailForm>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });

  const { handleSubmit, reset } = context;

  const _onSubmit = async (values) => {
    if (onSubmit) {
      onSubmit(values, context);
    } else {
      console.log('values', values);
      // await call here
      // if (!res.error) {
      if (true) {
        reset();
        snackBar({
          message: 'Kontaktuppgifterna sparades.',
          status: 'success',
        });
      } else {
        snackBar({
          message: 'Det gick inte att spara intresseområdet.',
          status: 'error',
        });
      }
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
