import { FrontendMessageResponse } from '@interfaces/case';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import {
  Button,
  FileUpload,
  FormControl,
  FormErrorMessage,
  Link,
  Modal,
  Textarea,
  UploadFile,
  useThemeQueries,
} from '@sk-web-gui/react';
import { toBase64 } from '@utils/toBase64';
import dayjs from 'dayjs';
import { Info, Reply, X } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CaseContext } from '../case-layout.component';
import { messagePreview, senderLabel } from './utils';

interface NewMessage {
  files: UploadFile[];
  message: string;
}

const MESSAGE_CHARACTER_LIMIT = 10000;
const MAX_FILE_SIZE_MB = 25;

export default function CaseNewMessage(props: { replyTo?: FrontendMessageResponse; onCancelReply?: () => void }) {
  const { replyTo, onCancelReply } = props;
  const { t } = useTranslation('cases');
  const { isMinDesktop } = useThemeQueries();
  const context = useForm<NewMessage>({ defaultValues: { files: [], message: '' }, mode: 'onChange' });
  const { caseData, refetchMessages } = useContext(CaseContext);
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const [showModal, setShowModal] = useState<boolean>(false);

  // Move focus into the textarea when the user picks a message to reply to.
  useEffect(() => {
    if (replyTo) {
      context.setFocus('message');
    }
  }, [replyTo, context]);

  const files = context.watch('files');
  const messageValue = context.watch('message') ?? '';
  const messageRegister = context.register('message', {
    required: t('cases:messages.validationRequired'),
    validate: (value) =>
      value.length <= MESSAGE_CHARACTER_LIMIT ||
      t('cases:messages.validationTooLong', { limit: MESSAGE_CHARACTER_LIMIT }),
  });
  const messageLength = messageValue.length;
  const isMessageOverLimit = messageLength > MESSAGE_CHARACTER_LIMIT;

  const postMessageMutation = useApi({
    url: `/cases/${caseData?.caseId}/messages`,
    method: 'post',
    axiosParameters: { headers: { 'Content-Type': 'multipart/form-data' } },
  });

  const isNewMessagesDisabled = useMemo(() => {
    if (!caseData || caseData?.status?.code !== 0) return false;

    const lastChanged = caseData?.lastStatusChange ? dayjs(caseData.lastStatusChange) : null;
    if (!lastChanged || !lastChanged.isValid()) return false;
    const inclusiveEnd = lastChanged.add(15, 'days').endOf('day');
    return dayjs().isAfter(inclusiveEnd);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData?.status?.code, caseData?.lastStatusChange]);

  if (isNewMessagesDisabled) {
    return (
      <div className="self-stretch flex flex-col gap-y-24">
        <div
          role="status"
          className="flex items-center gap-x-12 rounded-xl border p-16 mb-16 bg-background-200 border-info-surface-accent-DEFAULT "
        >
          <Info className="w-20 h-20 shrink-0" aria-hidden="true" />
          <p className="text-small">
            {t('cases:messages.disabledNotice')}
            <Link href="tel:+466012312">060-123 12</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleOnSubmit: SubmitHandler<NewMessage> = async (values) => {
    const formData = new FormData();
    formData.append('message', values.message);
    if (replyTo?.messageId) {
      formData.append('inReplyToId', replyTo.messageId);
    }

    if (values.files.length) {
      try {
        await Promise.all(
          values.files.map(async (file) => {
            if (file.file instanceof Blob) {
              const fileData = await toBase64(file.file);
              const buf = Buffer.from(fileData, 'base64');
              const blob = new Blob([buf], { type: file.file.type });
              formData.append('files', blob, `${file.meta.name}.${file.meta.ending}`);
            } else {
              console.warn('Invalid file structure:', file);
            }
          })
        );
      } catch (error) {
        console.error('Error processing files:', error);
      }
    }

    try {
      const res = await postMessageMutation.mutateAsync(formData);
      if (!res.error) {
        context.reset();
        refetchMessages?.();
        onCancelReply?.();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      context.setError('root', {
        type: 'manual',
        message: t('cases:messages.sendError'),
      });
    }
  };

  const handleRemoveFile = (file: UploadFile) => {
    context.setValue(
      'files',
      context.watch('files').filter((x) => x !== file)
    );
  };

  return (
    <>
      <div className="self-stretch flex flex-col gap-y-24">
        <FormProvider {...context}>
          <form className="flex flex-col gap-lg" onSubmit={context.handleSubmit(handleOnSubmit)}>
            <div className="flex flex-col gap-y-24">
              {replyTo ? (
                <div className="flex items-start gap-8 rounded-12 border-l-4 border-vattjom-surface-primary bg-background-200 px-12 py-8">
                  <Reply size={16} className="shrink-0 mt-2 text-secondary" />
                  <div className="flex flex-col gap-y-2 min-w-0 grow">
                    <span className="text-small font-bold">
                      {t('cases:messages.replyingTo', { sender: senderLabel(replyTo, user?.name, t) })}
                    </span>
                    <span className="text-small text-secondary line-clamp-2 break-words">
                      {messagePreview(replyTo, t)}
                    </span>
                  </div>
                  <Button
                    variant="tertiary"
                    size="sm"
                    iconButton
                    className="shrink-0"
                    aria-label={t('cases:messages.cancelReply')}
                    onClick={onCancelReply}
                  >
                    <X size={18} />
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-col">
                <p className="font-bold mb-[1.2rem]">{t('cases:messages.composerIntro')}</p>
                <FormControl className="w-full">
                  <Textarea
                    {...messageRegister}
                    placeholder={
                      replyTo ? t('cases:messages.placeholderReply') : t('cases:messages.placeholderMessage')
                    }
                    className="w-full min-h-72"
                    readOnly={postMessageMutation.isPending}
                  />
                  <div className="flex justify-between text-small mt-8">
                    <span className="text-dark-secondary">
                      {t('cases:messages.charLimit', { limit: MESSAGE_CHARACTER_LIMIT })}
                    </span>
                    <span className={isMessageOverLimit ? 'text-error' : 'text-dark-secondary'}>
                      {messageLength}/{MESSAGE_CHARACTER_LIMIT}
                    </span>
                  </div>
                  {context.formState.errors.message && (
                    <FormErrorMessage className="text-small text-error" role="alert">
                      {context.formState.errors.message.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FileUpload.Button
                  appendFiles={files}
                  className="mt-16"
                  maxFileSizeMB={MAX_FILE_SIZE_MB}
                  {...context.register('files')}
                />
                <div className="flex items-row text-small gap-5 mt-10">
                  <span className="text-dark-secondary">
                    {t('cases:messages.maxFileSize', { size: MAX_FILE_SIZE_MB })}
                  </span>{' '}
                  <Button variant="link" onClick={() => setShowModal(true)}>
                    {t('cases:messages.showFileTypes')}
                  </Button>
                </div>
              </div>

              {files.length ? (
                <div className="flex flex-col py-16 gap-y-16">
                  <h3 className="text-large font-normal font-[Arial]">{t('cases:messages.selectedFiles')}</h3>
                  <FileUpload.List name="files" showBorder>
                    {files?.map((file, i) => (
                      <FileUpload.ListItem
                        className="break-all"
                        key={`${file?.meta.name}-${i}`}
                        index={i}
                        actionsProps={{ showRemove: true, onRemove: () => handleRemoveFile(file) }}
                        file={file}
                      />
                    ))}
                  </FileUpload.List>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-y-8 desktop:items-start">
              <Button
                className="w-full desktop:w-fit"
                size={isMinDesktop ? 'md' : 'lg'}
                type="submit"
                color="vattjom"
                loading={postMessageMutation.isPending}
                disabled={isMessageOverLimit}
              >
                {replyTo ? t('cases:messages.sendReply') : t('cases:messages.send')}
              </Button>
              {context.formState.errors.root && (
                <FormErrorMessage className="text-small text-error" role="alert">
                  {context.formState.errors.root.message}
                </FormErrorMessage>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
      <Modal
        className="w-full max-w-[433px]"
        show={showModal}
        onClose={() => setShowModal(false)}
        label={t('cases:messages.allowedFileTypes')}
      >
        <Modal.Content>
          <ul className="text-dark-secondary space-y-3">
            <li>.jpeg</li>
            <li>.gif</li>
            <li>.png</li>
            <li>.tiff</li>
            <li>.bmp</li>
            <li>.pdf</li>
            <li>.rtf</li>
            <li>.doc</li>
            <li>.txt</li>
            <li>.html</li>
            <li>.bin</li>
            <li>.xls</li>
            <li>.msg</li>
            <li>.xlsx</li>
            <li>.odt</li>
            <li>.ods</li>
            <li>.docx</li>
            <li>.pptx</li>
          </ul>
        </Modal.Content>
      </Modal>
    </>
  );
}
