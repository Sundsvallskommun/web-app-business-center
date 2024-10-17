import { Card, Divider } from '@sk-web-gui/react';

export const ContentCard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Card className="block">
      <Card.Body className="w-full p-0">{children}</Card.Body>
    </Card>
  );
};

export default ContentCard;

export const ContentCardHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="flex justify-between items-center py-16 px-24">{children}</div>
      <Divider className="my-0" />
    </>
  );
};

export const ContentCardBody: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="p-24"> {children}</div>;
};

export const ContactDetailsGrid: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-wrap gap-x-[12rem] gap-y-40"> {children}</div>;
};
