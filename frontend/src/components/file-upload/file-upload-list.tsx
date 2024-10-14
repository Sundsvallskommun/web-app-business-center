import { Attachment, documentMimeTypes, useFileUpload } from '@components/file-upload/file-upload-context';
import { Button, cx, Icon, PopupMenu } from '@sk-web-gui/react';
import { Fragment } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface FileUploadListProps<TAttachment extends Attachment> {
  className?: string;
  /** @default true */
  showItemMenu?: boolean;
  onDelete?: (attachment: TAttachment) => void;
  onOpen?: (attachment: TAttachment) => void;
}

export default function FileUploadList<TAttachment extends Attachment>(props: FileUploadListProps<TAttachment>) {
  const { className, showItemMenu = true, onDelete, onOpen } = props;
  const { fieldName, setSelectedAttachmentIndex, setEditAttachmentWindowIsOpen } = useFileUpload();

  const { control, watch } = useFormContext();

  const { remove } = useFieldArray({
    control,
    name: fieldName,
  });

  return (
    <div className={cx('flex flex-col', className)} data-cy="attachments-list">
      {watch(fieldName)?.map((attachment: Attachment, index: number) => (
        <Fragment key={`${index}`}>
          <div
            data-cy={`attachment-${attachment.id}`}
            className={`attachment-item flex justify-between gap-12 rounded-sm p-12 text-md border-b first:border-t`}
          >
            <div className="flex gap-12">
              <div className={`self-center bg-vattjom-surface-accent p-12 rounded`}>
                <Icon
                  name={documentMimeTypes.find((d) => d.includes(attachment.mimeType)) ? 'file' : 'image'}
                  className="block"
                  size={24}
                />
              </div>
              <div>
                <p>
                  <strong>{attachment.name}</strong>{' '}
                </p>
              </div>
            </div>

            <div className="self-center relative">
              {/* Popup menu  */}
              {showItemMenu && (
                <PopupMenu>
                  <PopupMenu.Button
                    size="sm"
                    variant="primary"
                    aria-label="Alternativ"
                    color="primary"
                    iconButton
                    inverted
                  >
                    <Icon name="ellipsis" />
                  </PopupMenu.Button>
                  <PopupMenu.Panel>
                    <PopupMenu.Items>
                      <PopupMenu.Group>
                        <PopupMenu.Item>
                          <Button
                            data-cy={`open-attachment-${attachment.id}`}
                            leftIcon={<Icon name="eye" />}
                            onClick={() => {
                              setSelectedAttachmentIndex(index);
                              setEditAttachmentWindowIsOpen(true);
                              onOpen && onOpen(attachment);
                            }}
                          >
                            Öppna
                          </Button>
                        </PopupMenu.Item>
                      </PopupMenu.Group>
                      <PopupMenu.Group>
                        <PopupMenu.Item>
                          <Button
                            data-cy={`delete-attachment-${attachment.id}`}
                            leftIcon={<Icon name="trash" />}
                            onClick={() => {
                              remove(index);
                              onDelete && onDelete(attachment);
                            }}
                          >
                            Ta bort
                          </Button>
                        </PopupMenu.Item>
                      </PopupMenu.Group>
                    </PopupMenu.Items>
                  </PopupMenu.Panel>
                </PopupMenu>
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
