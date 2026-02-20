import { Button } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const RenewalInfo = ({ setIsEditing, setFormState }) => {
  return (
    <>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">Innan du ansöker</h2>
        <p className="mt-12">
          Du måste alltid bifoga ett läkarintyg när du ansöker om parkeringstillstånd för första gången.
        </p>
        <p className="mt-12">
          Vid ansökan om förlängning av befintligt parkeringstillstånd kan nytt läkarintyg behöva bifogas, vilket i
          regel framgår av tidigare beslut.
        </p>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">Har du fått läkarintyget via 1177:</h2>
        <ol>
          <li>1. Spara läkarintyget på din dator eller mobil.</li>
          <li>2. Ladda upp filen i ansökan</li>
        </ol>
      </div>
      <div>
        <h2 className="text-h4-sm desktop:text-h4-sm my-16">Vad händer efter din ansökan?</h2>
        <p className="mt-12">
          När du har skickat in din ansökan kommer ärendet att granskar av en handläggare innan du får ett beslut.
          Normal handläggningstid är cirka 10 arbetsdagar.
        </p>
      </div>
      <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
        <>
          <Button size="lg" variant="secondary" leftIcon={<ArrowLeft />} onClick={() => setIsEditing(null)}>
            Tillbaka
          </Button>
          <Button size="lg" color="vattjom" rightIcon={<ArrowRight />} onClick={() => setFormState('showForm')}>
            Påbörja ansökan
          </Button>
        </>
      </div>
    </>
  );
};
