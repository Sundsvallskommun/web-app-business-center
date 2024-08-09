import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from '@sk-web-gui/react';
import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useApi, useApiService } from '../../../../services/api-service';
import { ClientContactSetting } from '../../../../interfaces/contactsettings';

const defaultContactSettingsForm: Partial<ClientContactSetting> = {
  name: undefined,
  email: undefined,
  phone: undefined,
  notifications: {
    email_disabled: false,
    phone_disabled: false,
  },
  address: {
    street: '',
    postcode: '',
    city: '',
  },
  decicionsAndDocuments: {
    digitalInbox: true,
    myPages: true,
    snailmail: false,
  },
};

interface ContactSettingsFormLogicProps {
  children: React.ReactNode | React.ReactNode[];
  formData?: Partial<ClientContactSetting>;
  onSubmit?: (
    values: Partial<ClientContactSetting>,
    context: UseFormReturn<Partial<ClientContactSetting>, unknown, undefined>
  ) => void;
  onSubmitSuccess?: () => void;
  onSubmitFailed?: () => void;
}

const phoneRegExp = /^\+46\d{9}$/;

let formSchema = yup
  .object<ClientContactSetting>({
    name: yup.string().nullable().optional(),
    email: yup.string().email('E-postadress har fel format').nullable().optional(),
    phone: yup.string().matches(phoneRegExp, 'Telefonnummer har fel format').nullable().optional(),
    notifications: yup
      .object({
        email_disabled: yup.boolean(),
        phone_disabled: yup.boolean(),
      })
      .nullable()
      .optional(),
    address: yup
      .object({
        street: yup.string(),
        postcode: yup.string(),
        city: yup.string(),
      })
      .nullable()
      .optional(),
    decicionsAndDocuments: yup
      .object({
        digitalInbox: yup.boolean(),
        myPages: yup.boolean(),
        snailmail: yup.boolean(),
      })
      .nullable()
      .optional(),
  })
  .required();

export default function ContactSettingsFormLogic({
  children,
  formData = defaultContactSettingsForm,
  onSubmit,
  onSubmitSuccess,
  onSubmitFailed,
}: ContactSettingsFormLogicProps) {
  const snackBar = useSnackbar();
  const postMutation = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'post',
  });
  const patchMutation = useApi<ClientContactSetting>({
    url: `/contactsettings`,
    method: 'patch',
  });

  const context = useForm<Partial<ClientContactSetting>>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });
  const queryClient = useApiService((s) => s.queryClient);

  const isPatch = useCallback(() => {
    return typeof formData.id === 'string';
  }, [formData]);

  const { handleSubmit, reset } = context;

  const _onSubmit = async (values: Partial<ClientContactSetting>) => {
    if (onSubmit) {
      onSubmit(values, context);
    } else {
      const apiCall = isPatch() ? await patchMutation.mutateAsync : await postMutation.mutateAsync;
      const data: Partial<ClientContactSetting> = _.merge(formData, {
        id: formData.id,
        email: values.email,
        phone: values.phone,
        notifications: {
          email_disabled: values.notifications?.email_disabled,
          phone_disabled: values.notifications?.phone_disabled,
        },
        decicionsAndDocuments: {
          digitalInbox: values.decicionsAndDocuments?.digitalInbox,
          myPages: values.decicionsAndDocuments?.myPages,
          snailmail: values.decicionsAndDocuments?.snailmail,
        },
      });
      const res = await apiCall(data);
      if (!res.error) {
        queryClient.invalidateQueries({
          queryKey: ['/contactsettings'],
        });
        snackBar({
          message: 'Uppgifterna sparades.',
          status: 'success',
        });
        onSubmitSuccess && onSubmitSuccess();
      } else {
        snackBar({
          message: 'Det gick inte att spara uppgifterna.',
          status: 'error',
        });
        onSubmitFailed && onSubmitFailed();
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
