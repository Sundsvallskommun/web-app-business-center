import { Button } from '@sk-web-gui/react';
import { useState } from 'react';
import { FeedbackModal } from './feedback-modal.component';

export const Feedback: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="m-auto text-center px-md lg:px-lg mt-16 lg:w-2/3 py-lg">
        <h2 className="mb-md  text-lg md:text-xl">Hjälp oss bli bättre</h2>
        <p>Vad tycker du om Mina sidor Företag? Hjälp oss genom att lämna dina synpunkter på tjänsten.</p>
        <Button
          className="mt-[6px] min-w-[240px]"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Tyck till
        </Button>
      </div>
      <FeedbackModal
        isOpen={isOpen}
        closeModal={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
};
