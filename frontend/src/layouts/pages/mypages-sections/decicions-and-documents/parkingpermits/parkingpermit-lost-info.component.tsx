import { Button } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const LostPermitInfo = ({
  setIsEditing,
  setFormState,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<null | 'PERMIT_RENEWAL' | 'LOST_PERMIT'>>;
  setFormState: React.Dispatch<React.SetStateAction<'showForm' | 'showInfo' | 'success'>>;
}) => {
  return (
    <>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">Innan du anmäler</h2>
        <ul className="list-disc pl-20 mt-12">
          <li>Gör en polisanmälan gällande ditt borttappade tillstånd.</li>
          <li>Se till att du har tillgång till en kopia av polisanmälan i PDF-format.</li>
          <li>Samt identifiera diarienumret i polisanmälan.</li>
        </ul>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">Vad händer efter din anmälan?</h2>
        <p className="mt-12">
          När du har skickat in din anmälan kommer ärendet att granskas av en handläggare innan du får ett beslut.
          Normal handläggningstid är cirka 10 arbetsdagar.
        </p>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <Button size="lg" variant="secondary" leftIcon={<ArrowLeft />} onClick={() => setIsEditing(null)}>
          Tillbaka
        </Button>
        <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setFormState('showForm')}>
          Påbörja anmälan
        </Button>
      </div>
    </>
  );
};
