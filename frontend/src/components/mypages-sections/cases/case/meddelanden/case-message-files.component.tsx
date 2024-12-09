import { Button, Icon } from '@sk-web-gui/react';
import { File, Image } from 'lucide-react';

export default function CaseMessageFiles() {
  return (
    <div className="flex gap-x-16">
      {[...Array.from([1, 2, 3])].map((x, index) => {
        const iconType = <File /> || <Image />; // FIXME: implement filetype check
        return (
          <Button
            leftIcon={<Icon icon={iconType} />}
            variant="tertiary"
            size="sm"
            key={`${index}`}
          >{`fil-${x}.fil (789kB)`}</Button>
        );
      })}
    </div>
  );
}
