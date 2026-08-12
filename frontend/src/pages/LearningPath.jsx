import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROADMAP_MODULES = [
  { id: 'ARRAYS',   label: 'Arrays & Indexing', concept: 'Arrays',        threshold: 70, description: 'Contiguous memory, O(1) index access, search & traversal', estimatedQuestions: 5 },
  { id: 'LISTS',    label: 'Linked Lists',      concept: 'Linked Lists',  threshold: 70, description: 'Node pointers, singly & doubly linked lists, pointer manipulation', estimatedQuestions: 5 },
  { id: 'TREES',    label: 'Binary Trees',      concept: 'Binary Trees',  threshold: 70, description: 'Root, children, height, depth, and recursive traversals', estimatedQuestions: 6 },
  { id: 'BST',      label: 'BST Fundamentals',  concept: 'BST',           threshold: 70, description: 'Binary Search Tree property, search, min/max finding', estimatedQuestions: 7 },
  { id: 'BST_DEL',  label: 'BST Deletion',      concept: 'BST',           threshold: 80, description: 'Deleting leaf, 1-child, and 2-child nodes (successor replacement)', estimatedQuestions: 6 },
  { id: 'AVL',      label: 'AVL Trees',         concept: 'AVL',           threshold: 70, description: 'Self-balancing BSTs, balance factor invariant (-1, 0, +1)', estimatedQuestions: 6 },
  { id: 'AVL_ROT',  label: 'AVL Rotations',     concept: 'AVL',           threshold: 80, description: 'Single (LL, RR) and Double (LR, RL) balance rotation mechanics', estimatedQuestions: 6 },
  { id: 'GRAPHS',   label: 'Graph Structure',   concept: 'Graphs',        threshold: 70, description: 'Vertices, edges, directed/undirected, adjacency matrix & lists', estimatedQuestions: 6 },
  { id: 'BFS',      label: 'Breadth-First Search', concept: 'BFS',       threshold: 70, description: 'Queue-based level-order traversal and shortest path in unweighted graphs', estimatedQuestions: 5 },
  { id: 'DIJKSTRA', label: 'Dijkstra Algorithm', concept: 'Dijkstra',    threshold: 70, description: 'Single-source shortest path, greedy choice, min-priority queue', estimatedQuestions: 7 },
];

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

function getModuleStatus(index, masteryMap) {
  const mod = ROADMAP_MODULES[index];
  const mastery = masteryMap[mod.concept] ?? 0;

  if (mastery >= mod.threshold) return 'done';
  if (index === 0) return 'current';

  for (let i = 0; i < index; i++) {
    const prevMod = ROADMAP_MODULES[i];
    const prevMastery = masteryMap[prevMod.concept] ?? 0;
    if (prevMastery < prevMod.threshold) {
      return 'locked';
    }
  }

  return 'current';
}

function NodeBadge({ status, index }) {
  const bg =
    status === 'done' ? '#22c55e' :
    status === 'current' ? '#004CE5' :
    '#94a3b8';

  const borderColor =
    status === 'done' ? '#86efac' :
    status === 'current' ? '#004CE5' :
    '#cbd5e1';

  return (
    <div className="relative shrink-0 flex items-center justify-center">
      <div
        className="w-12 h-12 flex items-center justify-center text-white font-bold text-base cursor-pointer border-2"
        style={{ backgroundColor: bg, borderColor }}
      >
        {status === 'done' ? '\u2713' : status === 'current' ? (index + 1) : <LockIcon />}
      </div>
      {status === 'current' && (
        <div className="absolute inset-0 border-2 border-[#004CE5] opacity-30" />
      )}
    </div>
  );
}

export default function LearningPath() {
  const { authHeader, API } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selectedMod, setSelectedMod] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/api/student/state`, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { setError(json.message || 'Failed to load learning path.'); return; }
        setData(json);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[#004CE5] border-t-transparent animate-spin" />
    </div>
  );
  if (error) return <div className="card text-center py-12 text-[#dc2626]">{error}</div>;

  const { concepts } = data;
  const masteryMap = Object.fromEntries(concepts.map(c => [c.concept, c.mastery]));

  const completedCount = ROADMAP_MODULES.filter((_, i) => getModuleStatus(i, masteryMap) === 'done').length;
  const progressPct = Math.round((completedCount / ROADMAP_MODULES.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1>Learning Roadmap</h1>
          <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
            Progressive learning journey — {completedCount} of {ROADMAP_MODULES.length} modules completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums text-[#004CE5]">
            {progressPct}%
          </p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Roadmap Progress</p>
        </div>
      </div>

      <div className="card space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          <span>Journey Progress</span>
          <span>{completedCount} / {ROADMAP_MODULES.length} Milestones</span>
        </div>
        <div className="mastery-bar-track h-3">
          <div className="h-full transition-all duration-1000 bg-[#004CE5]"
            style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="relative py-8 px-4">
        <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-1 border-l-2 border-dashed pointer-events-none"
          style={{ borderColor: '#cbd5e1' }} />

        <div className="space-y-12 relative z-10">
          {ROADMAP_MODULES.map((mod, index) => {
            const status = getModuleStatus(index, masteryMap);
            const mastery = masteryMap[mod.concept] ?? 0;
            const isEven = index % 2 === 0;

            let borderLeftClass = 'border-l-4 border-l-[#E6F0FF] dark:border-l-[#1C2A4A]';
            let statusChipClass = 'bg-[#f1f5f9] dark:bg-[#1C2A4A] text-[#64748B] dark:text-[#94A3B8]';
            let thresholdColorClass = mastery >= mod.threshold ? 'text-[#15803d] dark:text-[#4ade80]' : 'text-[#a16207] dark:text-[#facc15]';

            if (status === 'done') {
              statusChipClass = 'bg-[#e6f7ee] dark:bg-[#0a2e1a] text-[#15803d] dark:text-[#4ade80]';
            } else if (status === 'current') {
              borderLeftClass = 'border-l-4 border-l-[#004CE5]';
              statusChipClass = 'bg-[#E6F0FF] dark:bg-[#0F1D3D] text-[#011A53] dark:text-[#8BB8FF]';
            }

            return (
              <div key={mod.id} className={`flex items-center gap-6 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
                  <div
                    onClick={() => setSelectedMod(mod)}
                    className={`card inline-block text-left cursor-pointer transition-all duration-200 max-w-sm w-full ${borderLeftClass}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-black dark:text-[#F3F4F6]">
                        {index + 1}. {mod.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 font-medium shrink-0 ${statusChipClass}`}>
                        {status === 'done' ? 'Completed' : status === 'current' ? 'Up Next' : 'Locked'}
                      </span>
                    </div>

                    <p className="text-xs line-clamp-2 mb-3 text-[#64748B] dark:text-[#94A3B8]">
                      {mod.description}
                    </p>

                    <div className="space-y-1 pt-2 border-t border-[#E6F0FF] dark:border-t-[#1C2A4A]">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">{mod.concept} Mastery</span>
                        <span className={thresholdColorClass}>
                          {mastery}% / {mod.threshold}%
                        </span>
                      </div>
                      <div className="mastery-bar-track h-1.5">
                        <div className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (mastery / mod.threshold) * 100)}%`,
                            backgroundColor: status === 'done' ? '#22c55e' : status === 'current' ? '#004CE5' : '#94a3b8',
                          }} />
                      </div>
                    </div>

                    {(status === 'current' || status === 'done') && (
                      <div className="mt-3 text-right">
                        <Link
                          to={`/assessment?mode=targeted&concept=${encodeURIComponent(mod.concept)}`}
                          className="btn-primary text-xs px-3 py-1.5 inline-block"
                        >
                          Practice {mod.concept}
                        </Link>
                      </div>
                    )}
                    {status === 'locked' && (
                      <p className="mt-2 text-[11px] italic text-[#64748B] dark:text-[#94A3B8]">
                        Requires previous module completion
                      </p>
                    )}
                  </div>
                </div>

                <NodeBadge status={status} index={index} />
                <div className="flex-1 hidden sm:block" />
              </div>
            );
          })}
        </div>
      </div>

      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card max-w-md w-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="chip chip-blue mb-1">{selectedMod.concept}</span>
                <h2 className="text-lg font-bold text-black dark:text-[#F3F4F6] mt-1">{selectedMod.label}</h2>
              </div>
              <button
                onClick={() => setSelectedMod(null)}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-black dark:hover:text-[#F3F4F6] text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-sm leading-relaxed text-black dark:text-[#F3F4F6]">
              {selectedMod.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFF] dark:bg-[#0D1325] p-3">
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block">Required Mastery</span>
                <span className="font-bold text-sm text-black dark:text-[#F3F4F6]">{selectedMod.threshold}%</span>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block">Est. Questions</span>
                <span className="font-bold text-sm text-black dark:text-[#F3F4F6]">~{selectedMod.estimatedQuestions}</span>
              </div>
            </div>

            {getModuleStatus(ROADMAP_MODULES.findIndex(m => m.id === selectedMod.id), masteryMap) !== 'locked' ? (
              <Link
                to={`/assessment?mode=targeted&concept=${encodeURIComponent(selectedMod.concept)}`}
                className="btn-primary w-full text-center block"
              >
                Practice {selectedMod.concept}
              </Link>
            ) : (
              <div className="text-center p-3 bg-[#F8FAFF] dark:bg-[#0D1325] text-[#64748B] dark:text-[#94A3B8] text-xs italic">
                Complete preceding modules to unlock this stage
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
