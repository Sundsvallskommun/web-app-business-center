import { ReactNode, createContext, useContext, useState } from 'react';

export interface Attachment {
  id?: string;
  name: string;
  mimeType: string;
  file: File | null;
  type?: string;
  base64String?: string;
}

export const downloadDocument = (attachment: Attachment) => {
  const uri = `data:${attachment.mimeType};base64,${attachment.base64String}`;
  const link = document.createElement('a');
  link.href = uri;
  link.setAttribute('download', `${attachment.name}`);
  document.body.appendChild(link);
  link.click();
};

export const imageMimeTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/tiff', 'image/bmp'];

export const documentMimeTypes = [
  'application/pdf',
  'application/rtf',
  'application/msword',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const acceptedUploadFileTypes = [
  'bmp',
  'gif',
  'tif',
  'tiff',
  'jpeg',
  'jpg',
  'png',
  'htm',
  'html',
  'pdf',
  'rtf',
  'docx',
  'doc',
  'txt',
  'xlsx',
  'xls',
  'odt',
  'ods',
  'text/html',
  'msg',
  ...imageMimeTypes,
  ...documentMimeTypes,
];

interface UseFileUploadProps {
  fieldName: string;
  acceptedUploadFileTypes: string[];
  dragDropEnabled: boolean;
  active: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  drop: FileList | null;
  setDrop: React.Dispatch<React.SetStateAction<FileList | null>>;
  addAttachmentWindowIsOpen: boolean;
  setAddAttachmentWindowIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editAttachmentWindowIsOpen: boolean;
  setEditAttachmentWindowIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAttachmentIndex: number | null;
  setSelectedAttachmentIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const defaultStates = {
  fieldName: 'attachments',
  dragDropEnabled: true,
  active: false,
  isLoading: false,
  isDragging: false,
  drop: null,
  addAttachmentWindowIsOpen: false,
  editAttachmentWindowIsOpen: false,
  selectedAttachmentIndex: null,
};

/** @ts-expect-error is set on mount */
export const FileUploadContext = createContext<UseFileUploadProps>(defaultStates);

export const useFileUpload = () => useContext(FileUploadContext);

interface FileUploadWrapperProps {
  children?: ReactNode;
  dragDropEnabled?: boolean;
  fieldName?: string;
  acceptedUploadFileTypes?: string[];
}

export const FileUploadContextWrapper: React.FC<FileUploadWrapperProps> = (props) => {
  const {
    children,
    dragDropEnabled = defaultStates.dragDropEnabled,
    fieldName: _fieldName = defaultStates.fieldName,
    acceptedUploadFileTypes: _acceptedUploadFileTypes = acceptedUploadFileTypes,
  } = props;
  const [isDragging, setIsDragging] = useState<UseFileUploadProps['isDragging']>(defaultStates.isDragging);
  const [isLoading, setIsLoading] = useState<UseFileUploadProps['isLoading']>(defaultStates.isLoading);
  const [active, setActive] = useState<UseFileUploadProps['active']>(defaultStates.active);
  const [drop, setDrop] = useState<UseFileUploadProps['drop']>(defaultStates.drop);
  const [addAttachmentWindowIsOpen, setAddAttachmentWindowIsOpen] = useState<
    UseFileUploadProps['addAttachmentWindowIsOpen']
  >(defaultStates.addAttachmentWindowIsOpen);
  const [editAttachmentWindowIsOpen, setEditAttachmentWindowIsOpen] = useState<
    UseFileUploadProps['editAttachmentWindowIsOpen']
  >(defaultStates.editAttachmentWindowIsOpen);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState<UseFileUploadProps['selectedAttachmentIndex']>(
    defaultStates.selectedAttachmentIndex
  );

  const context: UseFileUploadProps = {
    fieldName: _fieldName,
    acceptedUploadFileTypes: _acceptedUploadFileTypes,
    dragDropEnabled: dragDropEnabled,
    isDragging,
    isLoading,
    setIsLoading,
    setIsDragging,
    active,
    setActive,
    drop,
    setDrop,
    addAttachmentWindowIsOpen,
    setAddAttachmentWindowIsOpen,
    editAttachmentWindowIsOpen,
    setEditAttachmentWindowIsOpen,
    selectedAttachmentIndex,
    setSelectedAttachmentIndex,
  };

  return <FileUploadContext.Provider value={context}>{children}</FileUploadContext.Provider>;
};
