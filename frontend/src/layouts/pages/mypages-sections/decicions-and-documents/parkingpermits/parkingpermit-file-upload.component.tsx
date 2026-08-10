import { FileUpload, FormErrorMessage, UploadFile } from '@sk-web-gui/react';
import { ACCEPTED_UPLOAD_FILETYPES } from '@utils/accepted-file-types';

type ParkingPermitFileCategory = 'MEDICAL_CONFIRMATION' | 'POLICE_REPORT';

interface ParkingPermitFileUploadProps {
  category: ParkingPermitFileCategory;
  categoryLabel: string;
  dataCy?: string;
  errorMessage?: string;
  files: UploadFile[];
  maxFileSizeMB: number;
  onChange: (files: UploadFile[]) => void;
}

export const ParkingPermitFileUpload = ({
  category,
  categoryLabel,
  dataCy,
  errorMessage,
  files,
  maxFileSizeMB,
  onChange,
}: ParkingPermitFileUploadProps) => (
  <>
    {files.length > 0 ? (
      <FileUpload.List name="files">
        {files.map((file, index) => (
          <FileUpload.ListItem
            key={file.id}
            index={index}
            file={file}
            categoryProps={{ categories: { [category]: categoryLabel } }}
            actionsProps={{
              showRemove: true,
              onRemove: () => onChange(files.filter((candidate) => candidate !== file)),
            }}
          />
        ))}
      </FileUpload.List>
    ) : (
      <FileUpload.Field
        className="inline-block w-full"
        accept={ACCEPTED_UPLOAD_FILETYPES}
        variant="horizontal"
        name="files"
        maxFileSizeMB={maxFileSizeMB}
        data-cy={dataCy}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
    {errorMessage && (
      <FormErrorMessage className="text-error" role="alert">
        {errorMessage}
      </FormErrorMessage>
    )}
  </>
);
