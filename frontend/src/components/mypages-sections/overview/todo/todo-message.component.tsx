import { Button } from '@sk-web-gui/react';

export const TodoMessage = () => {
  return (
    <div className="flex items-center gap-x-md">
      <div>MESSAGE</div>
      <div className="grow my-md">
        <h2 className="text-h4-md">Nytt meddelande på ärende X</h2>
        <p>Du har ett nytt meddelande på ditt ärende Bygglov - Komplementbyggnad #X</p>
      </div>
      <div>
        <Button color="vattjom">Till meddelandet</Button>
      </div>
    </div>
  );
};
