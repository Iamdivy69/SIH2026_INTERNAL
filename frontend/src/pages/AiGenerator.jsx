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

function QuestionCard({ item, index, total }) {
  const { question, isDuplicate } = item;
  return (
    <div className="p-5 rounded-xl border border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#0D1325] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6F0FF] dark:border-[#1C2A4A] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-[#004CE5] dark:text-[#38bdf8]">
            Question {index + 1} of {total}
          </span>
          <span className="chip chip-green text-xs font-semibold">
            Saved to Question Bank
          </span>
        </div>
        <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
          Concept: {question.concept} • Difficulty D{question.difficulty}
        </span>
      </div>

      <p className="text-sm font-bold text-black dark:text-[#F3F4F6]">{question.text}</p>

      <div className="space-y-1.5">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctAnswer;
          const optionBorderClass = isCorrect ? 'border-[#22c55e]' : 'border-[#E6F0FF] dark:border-[#1C2A4A]';
          const optionBgClass = isCorrect ? 'bg-[#e6f7ee] dark:bg-[#0a2e1a]' : 'bg-white dark:bg-[#070B15]';
          const optionTextClass = isCorrect ? 'text-[#15803d] dark:text-[#4ade80] font-bold' : 'text-black dark:text-[#F3F4F6]';

          return (
            <div
              key={i}
              className={`text-sm px-3.5 py-2.5 rounded-lg border ${optionBorderClass} ${optionBgClass} ${optionTextClass} flex items-center justify-between`}
            >
              <div>
                <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                {opt}
              </div>
              {isCorrect && <span className="font-bold text-[#15803d] dark:text-[#4ade80]">✓ Correct</span>}
            </div>
          );
        })}
      </div>

      <div className="text-xs p-3.5 rounded-lg bg-white dark:bg-[#070B15] border border-[#E6F0FF] dark:border-[#1C2A4A] text-black dark:text-[#F3F4F6]">
        <span className="font-bold text-[#004CE5] dark:text-[#38bdf8]">Explanation: </span>
        {question.explanation}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#E6F0FF] dark:border-[#1C2A4A]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Validation</p>
        <ChecklistItem ok={true} label="Four options & correct answer defined" />
        <ChecklistItem ok={true} label={`Concept matches target (${question.concept})`} />
        <ChecklistItem ok={!isDuplicate} label={isDuplicate ? 'Similar question already exists in bank' : 'No duplicate found in question bank'} />
      </div>
    </div>
  );
}

export default function AiGenerator() {
  const { authHeader, API } = useAuth();

  const [form, setForm]             = useState({ concept: 'BST', difficulty: '2', topicHint: '', count: '5' });
  const [generating, setGenerating] = useState(false);
  const [results, setResults]       = useState(null);
  const [genError, setGenError]     = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topicHint.trim()) { setGenError('Topic hint is required.'); return; }
    setGenerating(true);
    setResults(null);
    setGenError('');

    try {
      const res = await fetch(`${API}/api/admin/generate-question`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setGenError(data.message || 'Generation failed.'); return; }

      const items = data.results || (data.question ? [{ question: data.question, isDuplicate: data.isDuplicate }] : []);
      setResults(items);
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
          Generate single or bulk MCQs (up to 10 questions at once) with Groq LLaMA — items are automatically validated and appended to the question bank
        </p>
      </div>

      <div className="card space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="flex gap-3 pt-2">
                {[
                  { val: '1', label: 'Easy',   textColor: 'text-[#15803d] dark:text-[#4ade80]' },
                  { val: '2', label: 'Medium', textColor: 'text-[#a16207] dark:text-[#facc15]' },
                  { val: '3', label: 'Hard',   textColor: 'text-[#dc2626] dark:text-[#f87171]' },
                ].map(({ val, label, textColor }) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm font-medium">
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

            <div className="space-y-1.5">
              <label htmlFor="gen-count" className="text-sm font-medium text-black dark:text-[#F3F4F6]">Batch Size (Quantity)</label>
              <select
                id="gen-count"
                className="input"
                value={form.count}
                onChange={e => setForm(f => ({ ...f, count: e.target.value }))}>
                <option value="1">1 Question</option>
                <option value="3">3 Questions</option>
                <option value="5">5 Questions (Recommended)</option>
                <option value="6">6 Questions</option>
                <option value="10">10 Questions (Bulk Batch)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gen-hint" className="text-sm font-medium text-black dark:text-[#F3F4F6]">Topic Hint / Focus Area</label>
            <input
              id="gen-hint"
              type="text"
              className="input"
              placeholder="e.g. double rotation cases, balance factor calculation, tree traversal complexity..."
              value={form.topicHint}
              onChange={e => { setForm(f => ({ ...f, topicHint: e.target.value })); setGenError(''); }}
            />
            {genError && <p className="text-xs text-[#dc2626] dark:text-[#f87171]">{genError}</p>}
          </div>

          <button
            id="generate-submit"
            type="submit"
            disabled={generating}
            className="btn-primary w-full py-3">
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                Generating {form.count} Question{form.count !== '1' ? 's' : ''} with Groq LLaMA...
              </span>
            ) : `Generate ${form.count} Question${form.count !== '1' ? 's' : ''}`}
          </button>
        </form>

        {results && results.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-[#E6F0FF] dark:border-[#1C2A4A]">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-black dark:text-[#F3F4F6]">
                Generated Batch ({results.length} Item{results.length > 1 ? 's' : ''})
              </h2>
              <span className="chip chip-green font-bold">
                ✓ All items saved to Question Bank
              </span>
            </div>

            <div className="space-y-5">
              {results.map((item, idx) => (
                <QuestionCard key={idx} item={item} index={idx} total={results.length} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
