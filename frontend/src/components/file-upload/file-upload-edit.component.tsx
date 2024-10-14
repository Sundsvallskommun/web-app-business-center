import { Attachment, useFileUpload } from '@components/file-upload/file-upload-context';
import { Image, Modal, Spinner } from '@sk-web-gui/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface FileUploadEditProps {
  fieldName: string;
  attachment?: Attachment | null;
  isLoading?: boolean;
}

export default function FileUploadEdit({ fieldName, attachment: _attachment, isLoading = false }: FileUploadEditProps) {
  const { editAttachmentWindowIsOpen, setEditAttachmentWindowIsOpen, selectedAttachmentIndex } = useFileUpload();

  const { watch } = useFormContext();
  const attachment: Attachment = watch(`${fieldName}.[${selectedAttachmentIndex}]`) || _attachment;

  //   useEffect(()=>{
  //     attachment.file?.arrayBuffer.toString('base64')
  //   })

  return (
    <Modal
      show={editAttachmentWindowIsOpen}
      as="div"
      className="fixed inset-0 z-20 overflow-y-auto bg-opacity-50 bg-gray-500"
      onClose={() => setEditAttachmentWindowIsOpen(false)}
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      {/* <DialogBackdrop className="fixed inset-0 bg-black/30" /> */}

      {/* Full-screen container to center the panel */}
      {/* <div className="fixed inset-0 flex w-screen items-center justify-center p-4"> */}
      <Modal.Content className="w-[84rem]">
        {/* <button className="modal-close-btn" onClick={() => setEditAttachmentWindowIsOpen(false)}>
            <span className="material-icons-outlined">close</span>
          </button> */}
        <h1 className="text-xl my-sm">{attachment?.name}</h1>

        <div className="flex flex-col justify-center items-center my-lg">
          <div className="flex-grow-0 my-md">
            <div className="flex flex-col justify-center items-center my-lg">
              {isLoading ? (
                <Spinner size={24} />
              ) : (
                <Image alt={attachment?.name} src={`data:${attachment?.mimeType};base64,${attachment?.file}`} />
              )}
            </div>
          </div>
        </div>
      </Modal.Content>
      {/* </div> */}
    </Modal>
  );
}
