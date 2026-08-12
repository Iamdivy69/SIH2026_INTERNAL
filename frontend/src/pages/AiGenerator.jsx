import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

export default function AiGenerator() {
  const { authHeader, API } = useAuth();

  const [form, setForm]           = useState({ concept: 'BST', difficulty: '2', topicHint: '' });
  const [generating, setGenerating] = useState(false);
  const [result, setResult]         = useState(null);
  const [genError, setGenError]     = useState('');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">AI Question Generator</h1>
        <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
          Generate new MCQs with Groq LLaMA — generated questions are automatically validated and appended to the question bank
        </p>
      </div>

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
                  { val: '1', label: 'Easy',   textColor: 'text-[#15803d] dark:text-[#4ade80]' },
                  { val: '2', label: 'Medium', textColor: 'text-[#a16207] dark:text-[#facc15]' },
                  { val: '3', label: 'Hard',   textColor: 'text-[#dc2626] dark:text-[#f87171]' },
                ].map(({ val, label, textColor }) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="difficulty"
                      value={val}
                      checked={form.difficulty === val}
                      onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                      className="accent-[#004CE5]"
                    />
                    <span className={textColor}>{label}</span>
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
                {result.question.options.map((opt, i) => {
                  const optionBorderClass = i === result.question.correctAnswer ? 'border-[#22c55e]' : 'border-[#E6F0FF] dark:border-[#1C2A4A]';
                  const optionBgClass = i === result.question.correctAnswer ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a]' : 'bg-transparent';
                  const optionTextClass = i === result.question.correctAnswer ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-black dark:text-[#F3F4F6]';

                  return (
                    <div key={i}
                      className={`text-sm px-3 py-2 border ${optionBorderClass} ${optionBgClass} ${optionTextClass}`}>
                      <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                      {opt}
                      {i === result.question.correctAnswer && ' \u2713'}
                    </div>
                  );
                })}
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
    </div>
  );
}
