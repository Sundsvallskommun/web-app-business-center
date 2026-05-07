'use client';

import { Button, Icon } from '@sk-web-gui/react';
import { FileQuestion } from 'lucide-react';
import { CardElevated } from '../components/cards/card-elevated.component';
import { CenterDiv } from '../layouts/center-div.component';
import { EntryLayout } from '../layouts/entry-layout.component';
import Main from '../layouts/main.component';
import Link from 'next/link';

export default function NotFound() {
  return (
    <EntryLayout title="404">
      <div className="w-full max-w-[64rem]">
        <CardElevated>
          <Main>
            <CenterDiv className="py-24 gap-y-40">
              <h1 className="text-center text-h2-sm lg:text-h2-lg m-0">Sidan kunde inte hittas</h1>
              <div className="flex gap-x-32 justify-center">
                <Icon icon={<FileQuestion />} size={96} />
              </div>
              <p className="text-center text-large m-0">Sidan du söker finns inte eller har flyttats.</p>
              <Link href="/" passHref>
                <Button as="a" variant="primary" color="vattjom" size="lg">
                  Till startsidan
                </Button>
              </Link>
            </CenterDiv>
          </Main>
        </CardElevated>
      </div>
    </EntryLayout>
  );
}
