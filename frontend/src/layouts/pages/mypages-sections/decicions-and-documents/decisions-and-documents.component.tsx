'use client';

import { Assets } from './assets.component';
import { Decisions } from './decisions.component';

export const DecisionsAndDocuments = () => {
  return (
    <div>
      <h1>Dina beslut och dokument</h1>
      <p className="my-0">Här samlar vi dina avtal, beslut och andra dokument som du får från oss.</p>
      <p className="my-0">
        Väntar du på ett beslut eller har ett pågående ärende så hittar du det under Ärenden i menyn.
      </p>
      <div className="mt-40">
        <Decisions />
        <Assets />
      </div>
    </div>
  );
};
