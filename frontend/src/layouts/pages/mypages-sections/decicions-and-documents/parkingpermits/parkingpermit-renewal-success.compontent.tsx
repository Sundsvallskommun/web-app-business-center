import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight, CircleCheckBig } from 'lucide-react';

export const RenewalSuccess = ({ setIsEditing }) => {
  return (
    <>
      <div className="flex flex-col gap-24">
        <Icon icon={<CircleCheckBig />} size={48} color="success" />
        <h1 className="text-h2-sm desktop:text-h2-lg mb-0 break-word hyphens-auto">Ansökan inskickad</h1>
        <div>
          <p className="mt-0">Din ansökan om att förlänga ditt parkeringstillstånd är inskickad.</p>
          <p className="mt-0">
            Vi handlägger ärendet och meddelar dig när ett beslut finns tillgängligt på Mina sidor.
          </p>
        </div>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <>
          <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setIsEditing(null)}>
            Tillbaka till översikt
          </Button>
        </>
      </div>
    </>
  );
};
