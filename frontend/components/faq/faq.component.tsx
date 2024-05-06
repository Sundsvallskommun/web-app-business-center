import { Accordion, Link } from '@sk-web-gui/react';

export const FaqSection = () => (
  <div className="m-auto px-md lg:px-lg mt-16 lg:w-2/3 mb-[106px]">
    <h2 className="mb-md  text-lg md:text-xl">Vanliga frågor</h2>

    <div className="flex flex-col space-y-6">
      <Accordion accordionTitle="Hur lång tid tar det att handlägga min ansökan om bygglov?">
        <p>
          Handläggningstiden kan variera beroende på vilken typ av ärende det handlar om. Under{' '}
          <Link external href="https://e-tjanster.sundsvall.se/oversikt/flowoverview/1544">
            Bygglovsguiden
          </Link>{' '}
          hittar du mer information.
        </p>
      </Accordion>

      <Accordion accordionTitle="Hur lång tid tar det att handlägga min ansökan om alkoholtillstånd?">
        <p>
          Den normala handläggningstiden är omkring 8 veckor. Handläggningstiden räknas från det datum när en komplett
          ansökan kommit in till oss.
        </p>
      </Accordion>

      <Accordion accordionTitle="Hur lång tid tar det att handlägga min ansökan om livsmedelshantering?">
        <p>
          Den normala handläggningstiden är omkring 6 veckor. Handläggningstiden räknas från det datum när en komplett
          ansökan kommit in till oss.
        </p>
      </Accordion>

      <Accordion accordionTitle="Varför tar det så lång tid att få beslut på mitt ärende?">
        <p>
          Vi gör vårt bästa för att ge dig ett snabbt besked. Innan du skickar in din ansökan, kontrollera vilka
          handlingar vi behöver för att kunna handlägga ditt ärende. Om din ansökan är komplett från början går det
          snabbare att handlägga den.
        </p>
      </Accordion>
    </div>
  </div>
);
