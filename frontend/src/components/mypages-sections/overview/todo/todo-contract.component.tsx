import { Button } from '@sk-web-gui/react';

export const TodoContract = () => {
  return (
    <div className="flex items-center gap-x-md">
      <div>CONTRACT</div>
      <div className="grow my-md">
        <h2 className="text-h4-md">Förnya avtal X</h2>
        <p>
          Ditt avtal går ut den <strong>27 april</strong> och behöver förnyas.
        </p>
      </div>
      <div>
        <Button color="vattjom">Till avtalet</Button>
      </div>
    </div>
  );
};
