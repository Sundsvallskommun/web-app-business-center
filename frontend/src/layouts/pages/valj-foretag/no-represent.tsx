import { CardElevated } from '@components/cards/card-elevated.component';
import { RepresentingMode } from '@interfaces/app';
import { EntryLayout } from '@layouts/entry-layout.component';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { Button, Icon, Link } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { appURL } from '../../../utils/app-url';

export const NoRepresent: React.FC = ({}) => {
  const router = useRouter();
  const { setRepresenting } = useRepresentingSwitch();

  const goPrivate = async () => {
    const res = await setRepresenting({ mode: RepresentingMode.PRIVATE, organizationNumber: undefined });
    if (res?.error) return;
    router.push('/privat/oversikt');
  };

  const onLogout = () => {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout?successRedirect=${`${appURL()}/login?loggedout`}`); // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return (
    <EntryLayout title="Företagscenter Mina Sidor - Logga In">
      <CardElevated className="p-10">
        <div className="flex items-center justify-center">
          <div className="max-w-[68rem] p-20 ">
            <div className="mb-14">
              <h1 className="text-xl">Hoppsan, vi hittade inget företag som är registrerat på dig</h1>

              <p className="my-0">
                När du loggar in gör vi en kontroll mot Bolagsverket och Skatteverket, men vi fick ingen träff på ditt
                personnummer.
              </p>
              <p className="my-0">
                Du kan läsa mer om hur vi hämtar information och hur kontrollen fungerar i våra{' '}
                <Link href="https://naringslivsbolaget.se/nu-lanserar-vi-mina-sidor-for-dig-som-foretagare/" external>
                  frågor och svar på naringslivsbolaget.se.
                </Link>
              </p>
            </div>

            <div className="flex flex-col gap-10 pt-10">
              <Button
                className="w-full"
                type="button"
                color="vattjom"
                onClick={() => goPrivate()}
                rightIcon={<Icon icon={<ArrowRight />} />}
              >
                Tillbaka till Mina sidor privat
              </Button>
              <Button className="w-full" onClick={() => onLogout()} data-cy="loginButton">
                Logga ut
              </Button>
            </div>
          </div>
        </div>
      </CardElevated>
    </EntryLayout>
  );
};
