import { useFileUpload } from '@components/file-upload/file-upload-context';
import { cx } from '@sk-web-gui/react';
import { UploadCloud } from 'lucide-react';
import { DragEvent, ReactNode } from 'react';

interface FileUploadWrapperProps {
  children?: ReactNode;
}

export const FileUploadArea: React.FC<FileUploadWrapperProps> = ({ children }) => {
  const { dragDropEnabled, active, setDrop, isDragging, setIsDragging } = useFileUpload();

  const handleDragFile = (event: DragEvent<HTMLDivElement>) => {
    // if (active) {
    event.preventDefault();
    setIsDragging(true);
    // }
  };
  const handleDragFileEnd = (event: DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    event.preventDefault();
  };

  const handleDropFile = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      setDrop(event.dataTransfer.files);
    }
    setIsDragging(false);
  };

  if (dragDropEnabled) {
    return (
      <>
        <div onDragEnter={handleDragFile}>{children}</div>
        {isDragging && (
          <div
            className={cx(
              'fixed',
              'top-0',
              'bottom-0',
              'left-0 ',
              'right-0',
              'bg-primitives-overlay-darken-6',
              'p-32',
              'rounded-20',
              'border-4 border-gronsta-text-primary',
              isDragging ? 'block' : 'hidden',
              'z-overlay'
            )}
            onDrop={handleDropFile}
            onDragOver={handleDragFile}
            onDragLeave={handleDragFileEnd}
            onClick={() => setIsDragging(false)}
          >
            <div
              className={cx(
                'w-full h-full',
                'border-dashed border-4 border-gronsta-text-primary',
                'flex items-center justify-center',
                'text-gronsta-text-primary'
              )}
            >
              <UploadCloud className="rounded-full bg-gronsta-surface-accent p-16 h-40 w-40 md:h-[8rem] md:w-[8-rem] xl:h-[12rem] xl:w-[12rem]" />
            </div>
          </div>
        )}
      </>
    );
  } else {
    return <>{children}</>;
  }
};
