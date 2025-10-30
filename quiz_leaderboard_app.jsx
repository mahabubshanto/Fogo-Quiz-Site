import React, { useState, useEffect } from 'react';

export default function QuizLeaderboardApp() {
  const [step, setStep] = useState('start');
  const [name, setName] = useState('');
  const [twitter, setTwitter] = useState('');
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: '4' },
    { id: 2, question: 'Capital of France?', options: ['Berlin', 'Paris', 'Madrid', 'Rome'], correct: 'Paris' },
    { id: 3, question: 'Who developed React?', options: ['Google', 'Meta', 'Microsoft', 'Amazon'], correct: 'Meta' }
  ]);
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correct: '' });

  // Utility: get current week key
  const getWeekKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week}`;
  };

  const weekKey = getWeekKey();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`leaderboard-${weekKey}`)) || [];
    setLeaderboard(saved);
  }, [weekKey]);

  const handleSubmit = () => {
    let s = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) s++;
    });
    setScore(s);

    const updated = [...leaderboard, { name, twitter, score: s, date: new Date().toISOString() }];
    updated.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    localStorage.setItem(`leaderboard-${weekKey}`, JSON.stringify(updated));
    setLeaderboard(updated);

    setStep('result');
  };

  const handleAdminLogin = () => {
    if (adminKey === 'admin123') setIsAdmin(true);
    else alert('Invalid admin key');
  };

  const addQuestion = () => {
    const id = questions.length + 1;
    setQuestions([...questions, { id, ...newQuestion }]);
    setNewQuestion({ question: '', options: ['', '', '', ''], correct: '' });
  };

  const resetLeaderboard = () => {
    localStorage.removeItem(`leaderboard-${weekKey}`);
    setLeaderboard([]);
  };

  const exportLeaderboard = () => {
    if (leaderboard.length === 0) {
      alert('No leaderboard data to export!');
      return;
    }

    const csvRows = [
      ['Rank', 'Name', 'Twitter', 'Score', 'Date'],
      ...leaderboard.map((u, i) => [i + 1, u.name, u.twitter, u.score, new Date(u.date).toLocaleString()])
    ];

    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${weekKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'start') {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Weekly Quiz Challenge</h1>
        <input placeholder="Your Name" className="border p-2 w-full mb-2" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Twitter Username" className="border p-2 w-full mb-2" value={twitter} onChange={e => setTwitter(e.target.value)} />
        <button onClick={() => setStep('quiz')} className="bg-blue-500 text-white px-4 py-2 rounded">Start Quiz</button>
        <div className="mt-4">
          <button onClick={() => setStep('leaderboard')} className="text-blue-700 underline">View Leaderboard</button>
        </div>
        <div className="mt-6 border-t pt-4">
          <input type="password" placeholder="Admin Key" value={adminKey} onChange={e => setAdminKey(e.target.value)} className="border p-2 w-full mb-2" />
          <button onClick={handleAdminLogin} className="bg-gray-700 text-white px-4 py-2 rounded w-full">Admin Login</button>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Answer the Questions</h2>
        {questions.map(q => (
          <div key={q.id} className="mb-4">
            <p className="font-medium">{q.id}. {q.question}</p>
            {q.options.map(opt => (
              <label key={opt} className="block">
                <input type="radio" name={`q${q.id}`} value={opt} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} /> {opt}
              </label>
            ))}
          </div>
        ))}
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">You scored {score} / {questions.length}</h2>
        <button onClick={() => setStep('leaderboard')} className="bg-blue-600 text-white px-4 py-2 rounded">View Leaderboard</button>
      </div>
    );
  }

  if (step === 'leaderboard') {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Leaderboard - {weekKey}</h2>
        {leaderboard.length === 0 && <p>No entries yet this week.</p>}
        <ol className="list-decimal pl-5">
          {leaderboard.map((u, i) => (
            <li key={i} className="my-1">{u.name} (@{u.twitter}) — <strong>{u.score}</strong> pts</li>
          ))}
        </ol>
        <button onClick={() => setStep('start')} className="bg-gray-700 text-white px-4 py-2 rounded mt-4">Back</button>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div className="mb-6 border p-4 rounded">
          <h3 className="font-semibold mb-2">Add New Question</h3>
          <input placeholder="Question" className="border p-2 w-full mb-2" value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} />
          {newQuestion.options.map((opt, i) => (
            <input key={i} placeholder={`Option ${i + 1}`} className="border p-2 w-full mb-2" value={opt} onChange={e => {
              const updated = [...newQuestion.options];
              updated[i] = e.target.value;
              setNewQuestion({ ...newQuestion, options: updated });
            }} />
          ))}
          <input placeholder="Correct Answer" className="border p-2 w-full mb-2" value={newQuestion.correct} onChange={e => setNewQuestion({ ...newQuestion, correct: e.target.value })} />
          <button onClick={addQuestion} className="bg-blue-600 text-white px-4 py-2 rounded">Add Question</button>
        </div>

        <div className="mb-6 border p-4 rounded">
          <h3 className="font-semibold mb-2">Manage Leaderboard ({weekKey})</h3>
          <div className="flex gap-2">
            <button onClick={resetLeaderboard} className="bg-red-600 text-white px-4 py-2 rounded">Reset This Week's Leaderboard</button>
            <button onClick={exportLeaderboard} className="bg-green-600 text-white px-4 py-2 rounded">Export as CSV</button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Current Questions</h3>
          <ul className="list-disc pl-5">
            {questions.map(q => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}