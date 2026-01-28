import GiftFinder from './components/GiftFinder';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎁 Gift Finder</h1>
        <p>Find the perfect gift for your special someone</p>
      </header>
      <main>
        <GiftFinder />
      </main>
    </div>
  );
}

export default App;
