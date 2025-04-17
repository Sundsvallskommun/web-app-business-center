'use client';

import { Assets } from './assets.component';

export const DecisionsAndDocuments = () => {
  return (
    <div>
      <h1>Dina beslut och dokument</h1>
      <p>Här samlar vi dina avtal, beslut och andra dokument som du får från oss.</p>
      <div className="mt-40">
        <Assets />
      </div>
    </div>
  );
};
