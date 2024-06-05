import { Card } from '@sk-web-gui/react';

export const ContentCard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Card className="block">
      <Card.Body className="w-full pt-24 px-24 pb-32">{children}</Card.Body>
    </Card>
  );
};

export default ContentCard;
