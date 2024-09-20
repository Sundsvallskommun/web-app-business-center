import { ICase } from '@interfaces/case';
import { Button } from '@sk-web-gui/react';

interface TodoCaseProps {
  data: ICase;
}

export const TodoCase = ({ data }: TodoCaseProps) => {
  return (
    <div className="flex items-center gap-x-md">
      <div>CASE</div>
      <div className="grow my-md">
        <h2 className="text-h4-md">{`Komplettering behövs på ärende #${data.caseId}`}</h2>
        <p>{`Handläggaren har begärt kompletterade uppgifter på ditt ärende ${data.subject.caseType}`}</p>
      </div>
      <div>
        <Button color="vattjom">Till ärendet</Button>
      </div>
    </div>
  );
};
