import { useState } from 'react';
import { getDailyQuestions, regenerateDailyQuestions } from './lib/questionSelector';
import { getHKDateString } from './lib/dateUtils';
import QuestionCard from './components/QuestionCard';
import NotificationSetup from './components/NotificationSetup';
import './App.css';

export default function App() {
  const [questions, setQuestions] = useState(() => getDailyQuestions());
  const todayStr = getHKDateString();

  function handleRegenerate() {
    setQuestions(regenerateDailyQuestions());
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-header__title">
          Cap.&nbsp;<span>621</span>&nbsp;Daily Test
        </h1>
        <p className="app-header__date">{todayStr} (HKT)</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <button className="btn btn--regen" onClick={handleRegenerate}>
            🔀 Regenerate
          </button>
        </div>

        <p className="app-section-title">Today's 6 Questions</p>

        <ol className="questions-list">
          {questions.map((q, i) => (
            <li key={q.id}>
              <QuestionCard question={q} index={i} />
            </li>
          ))}
        </ol>

        <NotificationSetup />

        <footer className="app-footer">
          Cap. 621 — Residential Properties (First-hand Sales) Ordinance
        </footer>
      </main>
    </div>
  );
}
