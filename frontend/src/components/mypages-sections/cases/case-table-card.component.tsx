import { Button, Card, Icon, Label, Callout, CalloutProps } from '@sk-web-gui/react';
import { ICase } from '@interfaces/case';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { useAppContext } from '@contexts/app.context';
import { ArrowRight } from 'lucide-react';

export const CaseTableCard: React.FC<{ item: ICase }> = ({ item }) => {
  const { representingMode } = useAppContext();
  return (
    <Card
      className="[&_a.sk-link]:text-[inherit]"
      href={`${getRepresentingModeRoute(representingMode)}/arenden/${item.externalCaseId}`}
    >
      <Card.Body className="w-full p-20">
        <div className="flex flex-col-reverse">
          <h3 className="font-bold text-large">{item.subject.caseType}</h3>
          <div className="flex justify-between flex-wrap mb-12 gap-y-12">
            <Label rounded inverted={item.status?.color !== 'neutral'} color={item.status?.color}>
              {item?.status?.label}
            </Label>
            <div className="flex gap-x-8 text-small">
              <label className="sr-only">Ärendenummer</label>
              <span>{item.caseId}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-x-6 mt-16 items-center">
          <Callout className="p-0" color={item.status?.color as CalloutProps['color']} />
          <strong>Nytt meddelande</strong>
        </div>
        <div className="mt-16 text-right">
          <Button variant="tertiary" iconButton leftIcon={<Icon icon={<ArrowRight />} />} />
        </div>
      </Card.Body>
    </Card>
  );
};
