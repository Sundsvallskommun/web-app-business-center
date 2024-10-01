import { Button, Icon } from '@sk-web-gui/react';

export default function CaseMessageFiles() {
  return (
    <div className="flex gap-x-16">
      {[...Array.from([1, 2, 3])].map((x, index) => {
        const iconType = 'file' || 'image'; // FIXME: implement filetype check
        return (
          <Button
            leftIcon={<Icon name={iconType} />}
            variant="tertiary"
            size="sm"
            key={`${index}`}
          >{`fil-${x}.fil (789kB)`}</Button>
        );
      })}
    </div>
  );
}
