import { FormControl, FormLabel, Input, Select, cx } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';

interface FileUploadEditFieldsProps {
  id: string;
  index: number;
  attachmentTypeLabels: { [key: string]: string };
  fieldName: string;
}

export default function FileUploadEditFields({
  id,
  index,
  attachmentTypeLabels,
  fieldName,
}: FileUploadEditFieldsProps) {
  const { register, watch } = useFormContext();
  return (
    <>
      <FormControl id={`${id}-name`} className="w-full">
        <FormLabel>Namn på bilaga</FormLabel>
        <Input data-cy="edit-filename-input" type="text" {...register(`${fieldName}.${index}.name`)} />
      </FormControl>

      {watch(fieldName)?.length > 0 && (
        <FormControl id={`${id}-attachmentTyp`} className="w-full">
          <FormLabel>Typ av bilaga</FormLabel>

          {/* <Input type="hidden" {...register(`${fieldName}.${index}.type`)} /> */}
          <Select
            data-cy={`${id}-attachmentType`}
            size="md"
            className="w-full"
            variant="tertiary"
            {...register(`${fieldName}.${index}.type`, {
              validate: {
                filetypeExists: (value) => {
                  const fileTypeExists = watch(fieldName).find(
                    (x) => x.type === value && x !== watch(fieldName)[index]
                  );
                  if (!fileTypeExists) {
                    return true;
                  } else {
                    return 'En bilaga av denna typ finns redan. För att lägga till en ny, ta först bort den gamla.';
                  }
                },
              },
            })}
          >
            <Select.Option value="">Välj typ av bilaga</Select.Option>
            {Object.entries(attachmentTypeLabels)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([key, label]) => {
                return (
                  <Select.Option
                    key={label as string}
                    value={key}
                    className={cx(`cursor-pointer select-none relative py-4 pl-10 pr-4`)}
                  >
                    {label as string}
                  </Select.Option>
                );
              })}
          </Select>
        </FormControl>
      )}
    </>
  );
}
