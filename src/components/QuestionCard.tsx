import { useState } from 'react';
import type { Question } from '../data/questions';

interface QuestionCardProps {
  question: Question;
  index: number;
}

const CATEGORY_LABELS: Record<Question['category'], string> = {
  basic: 'Basic',
  practical: 'Practical',
  tricky: 'Tricky',
};

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className={`question-card question-card--${question.category}`}>
      <header className="question-card__header">
        <span className={`badge badge--${question.category}`}>
          {CATEGORY_LABELS[question.category]}
        </span>
        <span className="question-card__id">#{question.id}</span>
        <span className="question-card__num">Q{index + 1}</span>
      </header>

      <p className="question-card__prompt">{question.prompt}</p>

      {!revealed ? (
        <button
          className="btn btn--reveal"
          onClick={() => setRevealed(true)}
          aria-expanded={false}
        >
          Show Answer
        </button>
      ) : (
        <div className="question-card__answer">
          <h3 className="question-card__answer-label">Answer</h3>
          <p className="question-card__answer-text">{question.answer}</p>
          <h3 className="question-card__rationale-label">Rationale</h3>
          <p className="question-card__rationale-text">{question.rationale}</p>
          <button
            className="btn btn--hide"
            onClick={() => setRevealed(false)}
            aria-expanded={true}
          >
            Hide Answer
          </button>
        </div>
      )}
    </article>
  );
}
