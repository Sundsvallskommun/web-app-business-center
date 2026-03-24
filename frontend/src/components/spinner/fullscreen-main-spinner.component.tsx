import { Spinner } from '@sk-web-gui/react';

export default function FullscreenMainSpinner() {
  return (
    <main>
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner aria-label="Laddar information" />
      </div>
    </main>
  );
}
