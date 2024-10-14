import { FileUploadArea } from '@components/file-upload/file-upload-area';
import { Attachment, FileUploadContextWrapper, useFileUpload } from '@components/file-upload/file-upload-context';
import FileUploadEdit from '@components/file-upload/file-upload-edit.component';
import FileUpload from '@components/file-upload/file-upload.component';
import { Button, FormControl, FormErrorMessage, Icon, Modal } from '@sk-web-gui/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface FileUploadModalProps {
  onUpload: (attachment: Attachment) => Promise<boolean>;
  attachmentTypeLabels: { [key: string]: string };
  dragDropEnabled?: boolean;
  allowMultiple?: boolean;
  maxFileSizeMB?: number;
  maxSizeHelperText?: string;
  acceptedUploadFileTypes?: string[];
  id?: string;
  fieldName?: string;
}

export function FileUploadModal(props: FileUploadModalProps) {
  const {
    onUpload,
    attachmentTypeLabels,
    acceptedUploadFileTypes: _acceptedUploadFileTypes,
    dragDropEnabled: _dragDropEnabled = true,
    allowMultiple = true,
    maxFileSizeMB = 1,
    maxSizeHelperText = `Maximal filstorlek: ${maxFileSizeMB} MB`,
    id = 'attachment',
    fieldName = 'attachments',
  } = props;

  const { reset, watch, formState } = useFormContext();
  const {
    acceptedUploadFileTypes,
    addAttachmentWindowIsOpen,
    setAddAttachmentWindowIsOpen,
    selectedAttachmentIndex,
    setSelectedAttachmentIndex,
    isLoading,
    dragDropEnabled,
  } = useFileUpload();
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    // reset({ ...watch(), [fieldName]: null });
    setErrorMessage('');
  };

  return (
    <div>
      <Modal
        show={addAttachmentWindowIsOpen}
        className="w-[43rem]"
        onClose={() => {
          setAddAttachmentWindowIsOpen(false);
          setSelectedAttachmentIndex(null);
          handleReset();
        }}
        label={'Ladda upp bilaga'}
      >
        <FileUploadArea>
          <Modal.Content>
            <FormControl id={`formcontrol-${id}`} className="w-full">
              <FileUpload
                fieldName={fieldName}
                id={id}
                attachmentTypeLabels={attachmentTypeLabels}
                editing={false}
                accept={_acceptedUploadFileTypes || acceptedUploadFileTypes}
                maxSizeHelperText={maxSizeHelperText}
                dragDropEnabled={_dragDropEnabled || dragDropEnabled}
                allowMultiple={allowMultiple}
                maxFileSizeMB={maxFileSizeMB}
              />
            </FormControl>
            {errorMessage && <p className="text-error mt-2">{errorMessage}</p>}
          </Modal.Content>

          <Modal.Footer>
            <Button
              className="w-full"
              disabled={!formState.isValid || selectedAttachmentIndex === null}
              type="submit"
              variant="primary"
              color="primary"
              loading={isLoading}
              loadingText="Laddar upp"
              onClick={async () => {
                const attachment = watch(`${fieldName}.[${selectedAttachmentIndex}]`);
                if (onUpload && attachment) {
                  try {
                    await onUpload(attachment);
                    handleReset();
                    setAddAttachmentWindowIsOpen(false);
                  } catch (err) {
                    setErrorMessage(err || 'Kunde inte ladda upp filen.');
                  }
                }
              }}
            >
              Ladda upp
            </Button>
          </Modal.Footer>
        </FileUploadArea>
      </Modal>
      <Button
        data-cy={`${id}-add-attachment-button`}
        color="vattjom"
        rightIcon={<Icon name="upload" size={16} />}
        size="sm"
        onClick={() => {
          handleReset();
          setAddAttachmentWindowIsOpen(true);
        }}
      >
        Ladda upp bilaga
      </Button>
      <FileUploadEdit fieldName={fieldName} />
    </div>
  );
}

export function FileUploadModalContextWrapped(props: FileUploadModalProps) {
  return (
    <FileUploadContextWrapper>
      <FileUploadModal {...props} />
    </FileUploadContextWrapper>
  );
}
