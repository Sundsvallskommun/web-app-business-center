import { Button, LucideIcon, Textarea } from '@sk-web-gui/react';

export default function CaseNewMessage() {
  return (
    <div className="self-stretch flex flex-col gap-y-24 mx-32">
      <div className="flex flex-col items-start gap-y-24">
        <Textarea placeholder="Skriv ett meddelande" className="w-full min-h-72" />
        <Button type="button" variant="tertiary" leftIcon={<LucideIcon name="paperclip" />}>
          Bifoga fil
        </Button>
      </div>
      <div className="flex justify-end">
        <Button size="lg" type="submit" color="vattjom">
          Skicka
        </Button>
      </div>
    </div>
  );
}
