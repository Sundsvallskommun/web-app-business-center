import { Button, cx, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { KeyboardEvent, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import FileUploadEditFields from '@components/file-upload/file-upload-edit-fields.component';
import { UploadCloud } from 'lucide-react';
import { useFileUpload } from './file-upload-context';

interface FileUploadProps {
  fieldName: string;
  dragDropEnabled: boolean;
  id: string;
  attachmentTypeLabels: { [key: string]: string };
  maxFileSizeMB: number;
  accept?: string[];
  editing: boolean;
  allowMultiple?: boolean;
  allowNameChange?: boolean;
  maxSizeHelperText?: string;
}

const FileUpload = (props: FileUploadProps) => {
  const {
    dragDropEnabled,
    fieldName: _fieldName,
    id,
    attachmentTypeLabels,
    maxFileSizeMB,
    accept = [],
    editing,
    allowMultiple = true,
    allowNameChange = true,
    maxSizeHelperText,
  } = props;
  const {
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const { setSelectedAttachmentIndex, fieldName = _fieldName, selectedAttachmentIndex } = useFileUpload();

  const ref = useRef<HTMLLabelElement>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  const imageMimeTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/tiff', 'image/bmp'];

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    // Max file size in bytes (from MB)
    const maxFileSize = maxFileSizeMB * 1024 * 1024;

    // Validate each file
    for (const file of files) {
      // Validate file type against accept list
      const validFileType = accept.includes(file.type);
      if (!validFileType) {
        const message = `Filtypen stöds ej: ${file.name}. Accepterade filtyper är: ${accept.join(', ')}`;
        setError(fieldName, { type: 'filetypeUnsupported', message: message });
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        const message = `Filen är för stor: ${file.name}. Överstiger ${maxFileSizeMB} MB.`;
        setError(fieldName, { type: 'filesize', message: message });
        return;
      }
    }

    setSelectedAttachmentIndex(watch(fieldName)?.length > 0 ? watch(fieldName)?.length - 1 : 0);

    // Clear any previous errors
    clearErrors(fieldName);

    const newAttachment = {
      file: files[0],
      name: files[0]?.name || '',
      mimeType: files[0]?.type,
    };

    // Append files to the field array
    append(newAttachment);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const { drop, setDrop } = useFileUpload();

  useEffect(() => {
    if (drop) {
      addFiles(drop);
      setDrop && setDrop(null);
    }
  }, [drop]);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      ref.current && ref.current.click();
    }
  };

  const singleUploadNotDragDrop = !dragDropEnabled && fields.length === 0;

  return (
    <>
      {!editing && (singleUploadNotDragDrop || dragDropEnabled || allowMultiple) ? (
        <div className="flex flex-col gap-16">
          {dragDropEnabled ? (
            <div>
              <div className="flex flex-col items-start mb-16">
                <FormLabel ref={ref} className="w-full">
                  <span className="mb-sm text-label font-bold hidden">Bilaga</span>
                  <div
                    data-cy={`${id}-dragdrop-upload`}
                    role="input"
                    onKeyDown={handleKeyPress}
                    onClick={() => {
                      document.getElementById(`${id}-openFileupload`)?.click();
                    }}
                    aria-label="Bilaga"
                    tabIndex={0}
                    className={cx(
                      'rounded-utility',
                      'focus-within:ring',
                      'focus-within:ring-ring',
                      'focus-within:ring-offset',
                      'text-base gap-16 box-border flex justify-center items-center',
                      'p-12 md:p-24 xl:p-32',
                      'border border-divider',
                      'hover:bg-vattjom-background-100 hover:border-2 border-dashed cursor-pointer'
                    )}
                  >
                    <UploadCloud className={cx('!h-[4rem] !w-[4rem] text-primary')} />
                    <div className="flex flex-col gap-8 justify-center">
                      <div className="text-base font-normal">
                        Dra {allowMultiple ? 'filer' : 'en fil'} hit eller{' '}
                        <span className="underline text-vattjom-text-primary">klicka för att bläddra på din enhet</span>
                      </div>
                      {maxSizeHelperText && (
                        <FormHelperText className="p-0 m-0 text-small text-dark-secondary">
                          {maxSizeHelperText}
                        </FormHelperText>
                      )}
                    </div>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    aria-labelledby={`${id}-new-attachment-item-label`}
                    id={`${id}-openFileupload`}
                    multiple={allowMultiple}
                    accept={accept.join(',')}
                    placeholder="Välj fil att lägga till"
                    onChange={onFileChange}
                  />
                </FormLabel>
              </div>
            </div>
          ) : (
            <>
              <p>Ladda upp en fil från din dator</p>

              <div className="flex items-center w-full justify-between">
                <Button
                  data-cy={`${id}-browse-button`}
                  className="w-full"
                  rounded
                  variant="secondary"
                  onClick={() => {
                    document.getElementById(`${id}-openFileupload`)?.click();
                  }}
                >
                  Bläddra
                </Button>

                <div className="hidden">
                  <FormControl id={`${id}-new-attachment-item`}>
                    <FormLabel>Välj fil att lägga till</FormLabel>
                    <Input
                      type="file"
                      aria-labelledby={`${id}-new-attachment-item-label`}
                      id={`${id}-openFileupload`}
                      multiple={allowMultiple}
                      accept={accept.join(',')}
                      placeholder="Välj fil att lägga till"
                      onChange={onFileChange}
                    />
                  </FormControl>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {errors[fieldName] &&
        Object.values(errors[fieldName])?.length > 0 &&
        Object.values(errors[fieldName])?.map(({ type }, idx) => {
          console.log('type', type);
          return (
            <FormErrorMessage key={`fileError-${idx}`} className="my-sm text-error">
              {`${type.message}`}
            </FormErrorMessage>
          );
        })}

      {watch(fieldName)?.length > 0 && (
        <div>
          <ul className="flex flex-col" data-cy="attachment-wrapper">
            {(watch(fieldName) as unknown as { id: string; file: File[] | null; name: string }[]).map(
              (field, index) => {
                return (
                  <li className="flex flex-col gap-16" key={`${index}`}>
                    <div className="my-sm w-full">
                      {!editing && (
                        <div className="flex justify-between">
                          <div className="flex w-5/6 gap-10">
                            <div className="bg-vattjom-surface-accent pt-4 pb-0 px-4 rounded self-center">
                              <Icon
                                name={imageMimeTypes.includes(field.file?.[index]?.type as string) ? 'image' : 'file'}
                                size={25}
                              />
                            </div>
                            <div className="overflow-hidden">
                              <p className="self-center" title={field.name}>
                                {field.name}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Button
                              aria-label={`Ta bort ${field.name}`}
                              iconButton
                              inverted
                              className="self-end"
                              onClick={(e) => {
                                e.preventDefault();
                                remove(index);
                              }}
                            >
                              <Icon name="x" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {allowNameChange ? (
                      <FileUploadEditFields
                        id={id}
                        index={selectedAttachmentIndex ?? index}
                        attachmentTypeLabels={attachmentTypeLabels}
                        fieldName={fieldName}
                      />
                    ) : null}
                  </li>
                );
              }
            )}
          </ul>
        </div>
      )}
      {/* {editing ? (
        <FileUploadEditFields index={0} attachmentTypeLabels={attachmentTypeLabels} fieldName={fieldName} />
      ) : null} */}
    </>
  );
};

export default FileUpload;
