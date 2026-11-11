import { publicAsset } from './utils/assets';

export function App() {
  return (
    <main className="app-shell">
      <header className="brand">
        <img src={publicAsset('/logo.svg')} width={56} height={56} alt="set.prio" />
        <div>
          <h1>
            set<span>.</span>prio
          </h1>
          <p>Tomorrowland Brasil 2027</p>
        </div>
      </header>
      <p>Plan your Tomorrowland weekend.</p>
    </main>
  );
}
