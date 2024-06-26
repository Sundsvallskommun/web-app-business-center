import { Card, Label } from '@sk-web-gui/react';
import { ICase } from '../../interfaces/case';

export const CaseTableCard: React.FC<{ item: ICase }> = ({ item }) => {
  return (
    <Card>
      <Card.Body className="w-full pt-24">
        <div className="flex flex-col-reverse mb-24">
          <div className="font-bold text-lead">{item.subject.caseType}</div>
          <div>
            <Label
              rounded
              inverted={item.status?.color !== 'neutral'}
              color={item.status?.color}
              className={`whitespace-nowrap mb-12`}
            >
              {item?.status?.label}
            </Label>
          </div>
        </div>
        <div>
          <div className="flex gap-x-8">
            <strong>Ärendenummer</strong>
            <span>{item.caseId}</span>
          </div>
          <div className="flex gap-x-8">
            <strong>Senast ändrat</strong>
            <span>{item.subject.meta.modified}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
