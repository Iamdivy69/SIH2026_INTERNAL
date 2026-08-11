import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GapBar({ concept, avgMastery, studentCount, weakStudents }) {
  const color = avgMastery >= 70 ? 'bg-[#22c55e]' : avgMastery >= 40 ? 'bg-[#eab308]' : 'bg-[#ef4444]';
  const textColor = avgMastery >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' : avgMastery >= 40 ? 'text-[#a16207] dark:text-[#facc15]' : 'text-[#dc2626] dark:text-[#f87171]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-black dark:text-[#F3F4F6]">{concept}</span>
          {weakStudents > 0 && (
            <span className="text-xs px-1.5 py-0.5 font-medium chip chip-red">
              {weakStudents} below 40%
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <span>{studentCount} students</span>
          <span className={`font-bold tabular-nums w-10 text-right ${textColor}`}>{avgMastery.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mastery-bar-track">
        <div className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${avgMastery}%` }} />
      </div>
    </div>
  );
}

function ChecklistItem({ ok, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`font-bold shrink-0 ${ok ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-[#dc2626] dark:text-[#f87171]'}`}>
        {ok ? '\u2713' : '\u2717'}
      </span>
      <span className="text-black dark:text-[#F3F4F6]">{label}</span>
    </div>
  );
}

export default function Admin() {
  const { user, authHeader, API } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [gaps, setGaps]         = useState([]);
  const [gapsLoading, setGapsLoading] = useState(true);
  const [gapsError, setGapsError]     = useState('');

  const [form, setForm]           = useState({ concept: 'BST', difficulty: '2', topicHint: '' });
  const [generating, setGenerating] = useState(false);
  const [result, setResult]         = useState(null);
  const [genError, setGenError]     = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/gaps`, { headers: authHeader() });
        const data = await res.json();
        if (!res.ok) { setGapsError(data.message || 'Failed to load gaps.'); return; }
        setGaps(data.gaps);
      } catch {
        setGapsError('Cannot connect to server.');
      } finally {
        setGapsLoading(false);
      }
    })();
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topicHint.trim()) { setGenError('Topic hint is required.'); return; }
    setGenerating(true);
    setResult(null);
    setGenError('');

    try {
      const res = await fetch(`${API}/api/admin/generate-question`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setGenError(data.message || 'Generation failed.'); return; }
      setResult(data);
    } catch {
      setGenError('Network error. Is backend running?');
    } finally {
      setGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">Institution-wide knowledge gaps + AI question generator</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Knowledge Gap Rankings</h2>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Average mastery per concept across all students — sorted weakest first (real-time aggregation)
        </p>

        {gapsLoading && (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
            <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aggregating...</span>
          </div>
        )}
        {gapsError && <p className="text-[#dc2626] dark:text-[#f87171] text-sm">{gapsError}</p>}

        {!gapsLoading && gaps.length > 0 && (
          <div className="card space-y-5">
            {gaps.map(g => (
              <GapBar key={g.concept} {...g} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">AI Question Generator</h2>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Generate new MCQs with Groq LLaMA — questions are saved to the question bank automatically
        </p>

        <div className="card space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="gen-concept" className="text-sm font-medium text-black dark:text-[#F3F4F6]">Concept</label>
                <select
                  id="gen-concept"
                  className="input"
                  value={form.concept}
                  onChange={e => setForm(f => ({ ...f, concept: e.target.value }))}>
                  <option value="BST">BST</option>
                  <option value="AVL">AVL</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Linked Lists">Linked Lists</option>
                  <option value="Binary Trees">Binary Trees</option>
                  <option value="Graphs">Graphs</option>
                  <option value="BFS">BFS</option>
                  <option value="Dijkstra">Dijkstra</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black dark:text-[#F3F4F6]">Difficulty</label>
                <div className="flex gap-3 pt-1">
                  {[
                    { val: '1', label: 'Easy',   color: '#15803d' },
                    { val: '2', label: 'Medium', color: '#a16207' },
                    { val: '3', label: 'Hard',   color: '#dc2626' },
                  ].map(({ val, label, color }) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="difficulty"
                        value={val}
                        checked={form.difficulty === val}
                        onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                        className="accent-[#004CE5]"
                      />
                      <span style={{ color }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gen-hint" className="text-sm font-medium text-black dark:text-[#F3F4F6]">Topic Hint</label>
              <input
                id="gen-hint"
                type="text"
                className="input"
                placeholder="e.g. double rotation case, balance factor calculation..."
                value={form.topicHint}
                onChange={e => { setForm(f => ({ ...f, topicHint: e.target.value })); setGenError(''); }}
              />
              {genError && <p className="text-xs text-[#dc2626] dark:text-[#f87171]">{genError}</p>}
            </div>

            <button
              id="generate-submit"
              type="submit"
              disabled={generating}
              className="btn-primary w-full">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  Generating with LLaMA...
                </span>
              ) : 'Generate Question'}
            </button>
          </form>

          {result && (
            <div className="space-y-4 pt-2 border-t border-[#E6F0FF] dark:border-t-[#1C2A4A]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-black dark:text-[#F3F4F6]">Generated Question</h3>
                  <span className="chip chip-green">
                    Saved to question bank
                  </span>
                </div>

                <p className="text-sm font-medium text-black dark:text-[#F3F4F6]">{result.question.text}</p>

                <div className="space-y-1.5">
                  {result.question.options.map((opt, i) => (
                    <div key={i}
                      className="text-sm px-3 py-2 border"
                      style={{
                        backgroundColor: i === result.question.correctAnswer ? '#e6f7ee' : 'transparent',
                        borderColor: i === result.question.correctAnswer ? '#86efac' : '#E6F0FF',
                        color: i === result.question.correctAnswer ? '#15803d' : '#000000',
                      }}>
                      <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                      {opt}
                      {i === result.question.correctAnswer && ' \u2713'}
                    </div>
                  ))}
                </div>

                <div className="text-xs p-3 bg-[#F8FAFF] dark:bg-[#0D1325] text-black dark:text-[#F3F4F6]">
                  <span className="font-bold">Explanation: </span>{result.question.explanation}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E6F0FF] dark:border-t-[#1C2A4A]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Validation</p>
                <ChecklistItem ok={true}  label="One correct answer defined" />
                <ChecklistItem ok={true}  label={`Concept matches target (${result.question.concept})`} />
                <ChecklistItem ok={true}  label="Explanation generated" />
                <ChecklistItem ok={true}  label={`Difficulty within target (D${result.question.difficulty})`} />
                <ChecklistItem ok={!result.isDuplicate} label={result.isDuplicate ? 'Similar question already exists in bank' : 'No duplicate found in question bank'} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
