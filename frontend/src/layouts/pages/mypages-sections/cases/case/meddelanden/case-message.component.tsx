import { Avatar, AvatarProps, Label } from '@sk-web-gui/react';
import CaseMessageFiles from './case-message-files.component';

export default function CaseMessage() {
  const isManager = true;
  const avatarSettings: { color: AvatarProps['color']; initials: string } = isManager
    ? {
        color: 'bjornstigen',
        initials: 'H',
      }
    : { color: 'gronsta', initials: 'J' };

  return (
    <div className="case-message flex flex-col gap-y-16 py-20 px-8">
      <div className="case-message-header flex gap-16">
        <Avatar color={avatarSettings.color} initials={avatarSettings.initials} accent size="sm" />
        <div className="flex items-center grow gap-16">
          <div className="text-large ellipsis">Handläggaren</div>
          <div className="text-small text-secondary">2024-09-06, 12:12</div>
          <div className="flex justify-end grow">
            <Label rounded color="vattjom" inverted>
              Nytt
            </Label>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-24">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id ex cursus nunc bibendum pretium id nec elit.
          Nullam pharetra pulvinar nulla, nec egestas ipsum mollis nec.
        </p>
        <CaseMessageFiles />
      </div>
    </div>
  );
}
