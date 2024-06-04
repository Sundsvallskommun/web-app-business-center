export const ContactDetailContentBox: React.FC<{ header: React.ReactNode; children?: React.ReactNode }> = ({
  header,
  children,
}) => {
  return (
    <div className="max-w-[29.6rem] basis-[29.6rem] flex flex-col gap-y-8">
      <div className="font-bold">{header}</div>
      <div>{children}</div>
    </div>
  );
};
