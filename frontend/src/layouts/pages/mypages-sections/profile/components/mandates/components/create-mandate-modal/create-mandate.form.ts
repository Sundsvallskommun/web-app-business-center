import dayjs from 'dayjs';
import { SignMandateDetails } from 'src/data-contracts/backend/data-contracts';
import * as yup from 'yup';

export const mandateSchema = yup
  .object<SignMandateDetails & { agree: boolean; name: string }>({
    granteeId: yup.string().required('profile:mandates.errors.grantee'),
    activeFrom: yup.string().required('profile:mandates.errors.activeFrom'),
    inactiveAfter: yup
      .string()
      .test('3YEARS', 'profile:mandates.errors.inactiveAfter.tooBig', (value, form) => {
        return dayjs(form.parent.activeFrom).add(3, 'years').toDate() >= dayjs(value).toDate();
      })
      .test('LARGERTHANSTART', 'profile:mandates.errors.inactiveAfter.tooSmall', (value, form) => {
        return dayjs(form.parent.activeFrom).toDate() < dayjs(value).toDate();
      })
      .optional(),
    agree: yup.boolean().required('profile:mandates.errors.agree').isTrue('profile:mandates.errors.agree'),
    name: yup.string(),
  })
  .required();
