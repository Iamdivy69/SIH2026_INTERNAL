import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DifficultyBadge({ level }) {
  const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const colors = {
    1: { fill: '#22c55e', text: 'text-[#15803d] dark:text-[#4ade80]' },
    2: { fill: '#eab308', text: 'text-[#a16207]' },
    3: { fill: '#ef4444', text: 'text-[#dc2626] dark:text-[#f87171]' },
  };
  const { fill, text } = colors[level] || colors[1];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      {[1, 2, 3].map(i => (
        <span key={i} className="w-2 h-2 inline-block"
          style={{ backgroundColor: i <= level ? fill : '#d1d5db' }} />
      ))}
      {labels[level]}
    </span>
  );
}

function WhyPanel({ reasoning, open, onToggle }) {
  if (!reasoning) return null;

  const chipClass =
    reasoning.isReinforcement ? 'chip-yellow' :
    reasoning.consecutiveCorrect >= 2 ? 'chip-green' :
    reasoning.mastery < 40 ? 'chip-red' :
    'chip-blue';

  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-0 py-0 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[#011A53] dark:text-[#8BB8FF]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          Why this question?
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="pt-4 mt-4 space-y-3 border-t border-[#E6F0FF] dark:border-[#1C2A4A]">
          <div>
            <span className={chipClass}>
              {reasoning.reason}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <div className="font-bold text-base text-black dark:text-[#F3F4F6]">{reasoning.mastery}%</div>
              <div className="text-[#64748B] dark:text-[#94A3B8]">Mastery</div>
            </div>
            <div className="p-2 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <div className="font-bold text-base text-black dark:text-[#F3F4F6]">{reasoning.concept}</div>
              <div className="text-[#64748B] dark:text-[#94A3B8]">Concept</div>
            </div>
            <div className="p-2 bg-[#F8FAFF] dark:bg-[#0D1325]">
              <div className="font-bold text-base text-black dark:text-[#F3F4F6]">
                {['', 'Easy', 'Medium', 'Hard'][reasoning.targetDifficulty]}
              </div>
              <div className="text-[#64748B] dark:text-[#94A3B8]">Difficulty</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransitionOverlay({ step }) {
  const steps = [
    'Analyzing response...',
    'Updating knowledge profile...',
    'Selecting next question...',
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card text-center space-y-4 max-w-sm w-full mx-4">
        <div className="w-10 h-10 mx-auto border-2 border-[#004CE5] border-t-transparent animate-spin" />
        <p className="font-semibold text-[#011A53] dark:text-[#8BB8FF]">
          {steps[step] || steps[0]}
        </p>
      </div>
    </div>
  );
}

function ProgressDots({ answered, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-3 h-3 transition-all duration-300"
          style={{
            backgroundColor: i < answered ? '#004CE5' : '#E6F0FF',
            outline: i === answered ? '2px solid #004CE5' : 'none',
            outlineOffset: '2px',
          }} />
      ))}
      <span className="ml-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
        ~{total} questions
      </span>
    </div>
  );
}

function ViolationModal({ count, onClose }) {
  const messages = {
    1: 'Violation 1 of 3: Leaving or switching away from the test screen (back button, tab switch, window blur) is tracked. Two more will end your assessment.',
    2: 'Violation 2 of 3: WARNING! Exiting fullscreen, changing tabs, or navigating away again will bring you to your final warning.',
    3: 'Violation 3 of 3: FINAL WARNING! Leaving the test screen one more time will terminate your assessment immediately with 0 score saved.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="card max-w-md w-full text-center space-y-4 border-l-4 border-l-[#ef4444]">
        <div className="w-12 h-12 bg-[#fdeaea] dark:bg-[#2e0f0f] text-[#dc2626] dark:text-[#f87171] flex items-center justify-center text-xl font-bold mx-auto">
          !
        </div>
        <h2 className="text-lg font-bold text-[#dc2626] dark:text-[#f87171]">Proctoring Violation Detected</h2>
        <p className="text-sm leading-relaxed text-black dark:text-[#F3F4F6]">
          {messages[count] || messages[1]}
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          I Understand & Resume Test
        </button>
      </div>
    </div>
  );
}

function PreTestRules({ mode, concept, onConfirm, onCancel }) {
  const modeLabels = {
    diagnostic: {
      title: 'Diagnostic Baseline Assessment',
      sub: '10 questions across all 8 data structure concepts to establish your starting knowledge profile.',
      badge: 'Diagnostic Baseline',
    },
    targeted: {
      title: `Targeted Practice: ${concept || 'Selected Topic'}`,
      sub: `7 questions focused on ${concept || 'the selected topic'} to sharpen your understanding.`,
      badge: 'Targeted Practice',
    },
    adaptive: {
      title: 'Adaptive Proctored Assessment',
      sub: '7 questions that dynamically adjust to your real-time knowledge level using Elo-based adaptive ranking.',
      badge: 'Adaptive Proctored',
    },
  };

  const info = modeLabels[mode] || modeLabels.adaptive;

  const rules = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      label: 'Full-Screen Lock',
      desc: 'The assessment runs in proctored full-screen mode. Exiting full-screen is recorded as a violation.',
      critical: false,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      ),
      label: 'Tab Switch & Window Focus',
      desc: 'Switching browser tabs, opening other applications, or shifting window focus is strictly monitored.',
      critical: false,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      ),
      label: 'Navigation Lock',
      desc: 'Browser Back/Forward buttons and attempts to navigate away during the test count as violations.',
      critical: false,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      label: 'Termination Penalty',
      desc: 'Accumulating 6 violations will immediately terminate your assessment. No score or mastery progress will be saved.',
      critical: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010D26]/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004CE5]/15 border border-[#004CE5]/30 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#004CE5] animate-pulse" />
            <span className="text-xs font-semibold text-[#004CE5] uppercase tracking-widest">{info.badge}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{info.title}</h1>
          <p className="text-sm text-[#8BB8FF]/70 max-w-md mx-auto leading-relaxed">{info.sub}</p>
        </div>

        {/* Rules card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8BB8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-sm font-semibold text-[#8BB8FF] uppercase tracking-wider">Proctoring Rules & System Monitoring</span>
          </div>

          <div className="divide-y divide-white/5">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4">
                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  rule.critical
                    ? 'bg-[#dc2626]/15 text-[#f87171]'
                    : 'bg-[#004CE5]/15 text-[#8BB8FF]'
                }`}>
                  {rule.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${rule.critical ? 'text-[#f87171]' : 'text-white'}`}>
                    {rule.label}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 px-6 rounded-xl bg-[#004CE5] hover:bg-[#0040C8] text-white text-sm font-bold tracking-wide transition-all duration-150 shadow-lg shadow-[#004CE5]/30"
          >
            I Understand — Start Assessment
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3.5 rounded-xl border border-white/15 text-sm font-medium text-white/50 hover:text-white hover:border-white/30 transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export default function Assessment() {
  const { authHeader, refreshUser, API } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') || 'adaptive';
  const conceptParam = searchParams.get('concept');

  const [sessionId] = useState(() => crypto.randomUUID());

  const [state, setState]                   = useState('rules');
  const [question, setQuestion]             = useState(null);
  const [reasoning, setReasoning]           = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult]     = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions]     = useState(() => (mode === 'diagnostic' ? 10 : 7));
  const [whyOpen, setWhyOpen]               = useState(true);
  const [transitionStep, setTransitionStep] = useState(0);
  const [error, setError]                   = useState('');

  const [violationCount, setViolationCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const lastViolationRef = useRef(0);
  const isTerminatedRef  = useRef(false);
  const [quitByUser, setQuitByUser]         = useState(false);

  const handleQuit = async () => {
    const confirmQuit = window.confirm(
      "Are you sure you want to quit the test? This session will be terminated and no progress will be saved."
    );
    if (!confirmQuit) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      isTerminatedRef.current = true;
      await fetch(`${API}/api/assessment/quit`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ sessionId }),
      });
      setQuitByUser(true);
      setState('terminated');
    } catch (err) {
      console.error('Error quitting assessment:', err);
      setQuitByUser(true);
      setState('terminated');
    }
  };

  const reportViolation = useCallback((type) => {
    if (
      isTerminatedRef.current ||
      state === 'rules' ||
      state === 'done' ||
      state === 'terminated' ||
      questionsAnswered >= totalQuestions
    ) return;

    const now = Date.now();
    if (now - lastViolationRef.current < 1000) return;
    lastViolationRef.current = now;

    fetch(`${API}/api/assessment/violation`, {
      method: 'POST',
      headers: authHeader(),
      keepalive: true,
      body: JSON.stringify({ sessionId, type }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.isTerminated) {
          isTerminatedRef.current = true;
          setState('terminated');
        } else if (data.violationCount > 0) {
          setViolationCount(data.violationCount);
          setShowWarningModal(true);
        }
      })
      .catch(err => console.error('Violation report error:', err));
  }, [sessionId, API, authHeader, state, questionsAnswered, totalQuestions]);

  // Handle visibility, fullscreen, blur, and popstate navigation attempts
  useEffect(() => {
    if (state === 'rules' || state === 'done' || state === 'terminated' || questionsAnswered >= totalQuestions) return;

    const handleVisibility = () => {
      if (document.hidden && questionsAnswered < totalQuestions) reportViolation('tab_switch');
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement && state !== 'done' && state !== 'terminated' && questionsAnswered < totalQuestions) {
        reportViolation('fullscreen_exit');
      }
    };
    const handleBlur = () => {
      if (questionsAnswered < totalQuestions) reportViolation('window_blur');
    };

    // Lock browser back/forward buttons during test
    if (questionsAnswered < totalQuestions) {
      window.history.pushState(null, '', window.location.href);
    }
    const handlePopState = (e) => {
      if (questionsAnswered < totalQuestions) {
        window.history.pushState(null, '', window.location.href);
        reportViolation('navigation_attempt');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [reportViolation, state, questionsAnswered, totalQuestions]);

  const fetchNextQuestion = useCallback(async () => {
    if (isTerminatedRef.current) return;
    setState('loading');
    setSelectedOption(null);
    setAnswerResult(null);
    setError('');

    try {
      const res = await fetch(`${API}/api/assessment/next?sessionId=${sessionId}`, {
        headers: authHeader(),
      });
      const data = await res.json();

      if (res.status === 403 && data.isTerminated) {
        isTerminatedRef.current = true;
        setState('terminated');
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Failed to fetch question.');
        setState('answering');
        return;
      }

      if (data.totalQuestions) {
        setTotalQuestions(data.totalQuestions);
      }

      if (data.done) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setState('done');
        return;
      }

      setQuestion(data.question);
      setReasoning(data.reasoning);
      setQuestionsAnswered(data.questionsAnswered);
      setState('answering');
    } catch {
      setError('Network error — is the backend running?');
      setState('answering');
    }
  }, [sessionId, API, authHeader]);

  const handleStartAssessment = () => {
    fetch(`${API}/api/assessment/start`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ sessionId, mode, concept: conceptParam }),
    }).catch(err => console.error('Start session error:', err));

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    fetchNextQuestion();
  };

  useEffect(() => {
    if (state === 'done') {
      if (typeof refreshUser === 'function') refreshUser();
      setTimeout(() => navigate('/assessment/results', { state: { sessionId, mode } }), 800);
    }
  }, [state, navigate, sessionId, mode, refreshUser]);

  const handleSubmit = async () => {
    if (selectedOption === null || !question || isTerminatedRef.current) return;
    setState('transitioning');
    setTransitionStep(0);

    try {
      const apiCall = fetch(`${API}/api/assessment/answer`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          questionId: question._id,
          selectedAnswer: selectedOption,
          timeSpent: 30,
          sessionId,
        }),
      });

      await new Promise(r => setTimeout(r, 250)); setTransitionStep(1);
      await new Promise(r => setTimeout(r, 250)); setTransitionStep(2);

      const res = await apiCall;
      const data = await res.json();

      await new Promise(r => setTimeout(r, 250));

      if (res.status === 403 && data.isTerminated) {
        isTerminatedRef.current = true;
        setState('terminated');
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Failed to submit answer.');
        setState('answering');
        return;
      }

      setAnswerResult(data);
      setQuestionsAnswered(data.questionsAnswered);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);

      if (data.done || data.questionsAnswered >= (data.totalQuestions || totalQuestions)) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }

      setState('revealing');
    } catch {
      setError('Network error submitting answer.');
      setState('answering');
    }
  };

  const handleCompleteNavigation = useCallback((path, navState) => {
    try {
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }

    if (typeof refreshUser === 'function') {
      try { refreshUser(); } catch { /* ignore */ }
    }

    navigate(path, navState ? { state: navState } : undefined);
  }, [navigate, refreshUser]);



  const handleNext = () => {
    if (questionsAnswered >= totalQuestions) {
      handleCompleteNavigation('/assessment/results', { sessionId, mode });
    } else {
      fetchNextQuestion();
    }
  };

  const handleDismissModal = () => {
    setShowWarningModal(false);
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const isTransitioning = state === 'transitioning';

  if (state === 'rules') {
    return (
      <PreTestRules
        mode={mode}
        concept={conceptParam}
        onConfirm={handleStartAssessment}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  if (state === 'terminated') {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-6">
        <div className="card border-l-4 border-l-[#ef4444] space-y-4 py-8">
          <div className="w-16 h-16 bg-[#fdeaea] dark:bg-[#2e0f0f] text-[#dc2626] dark:text-[#f87171] flex items-center justify-center text-2xl font-bold mx-auto">
            !
          </div>
          <h1 className="text-xl font-bold text-[#dc2626] dark:text-[#f87171]">
            {quitByUser ? 'Assessment Ended' : 'Assessment Terminated'}
          </h1>
          <p className="text-sm leading-relaxed px-4 text-black dark:text-[#F3F4F6]">
            {quitByUser
              ? 'You have manually exited the assessment. No score or mastery changes from this session were saved.'
              : 'Your assessment was terminated because 4 proctoring violations (tab switches, window blurs, or navigation attempts) were recorded. No score or mastery changes from this session were saved.'}
          </p>
          <div className="pt-2">
            <Link to="/dashboard" className="btn-primary inline-block text-sm px-6 py-2">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Header Title & Badge formatting
  const headerTitle =
    mode === 'diagnostic' ? 'Diagnostic Assessment' :
    mode === 'targeted' ? `Practice: ${conceptParam || question?.concept || 'Targeted'}` :
    'Adaptive Practice';

  const headerSub =
    mode === 'diagnostic' ? 'One-time baseline setup across all 8 concepts' :
    mode === 'targeted' ? `Focused practice questions on ${conceptParam || question?.concept || 'selected concept'}` :
    'Questions adapt to your knowledge level in real-time';

  const headerBadge =
    mode === 'diagnostic' ? 'Diagnostic Baseline' :
    mode === 'targeted' ? 'Targeted Practice' :
    'Adaptive Proctored';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isTransitioning && <TransitionOverlay step={transitionStep} />}
      {showWarningModal && (
        <ViolationModal count={violationCount} onClose={handleDismissModal} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-black dark:text-[#F3F4F6]">{headerTitle}</h1>
            <span className="chip chip-blue text-xs">
              {headerBadge}
            </span>
          </div>
          <p className="text-sm mt-0.5 text-[#64748B] dark:text-[#94A3B8]">
            {headerSub}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ProgressDots answered={questionsAnswered} total={totalQuestions} />
          <button
            onClick={handleQuit}
            className="btn-ghost text-xs text-[#ef4444] dark:text-[#f87171] hover:bg-[#fdeaea] dark:hover:bg-[#2e0f0f] border border-[#ef4444]/20 rounded px-2.5 py-1"
          >
            Quit Test
          </button>
        </div>
      </div>

      {state === 'loading' && (
        <div className="card flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-[#004CE5] border-t-transparent animate-spin" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Selecting your next question...</p>
          </div>
        </div>
      )}

      {(state === 'answering' || state === 'revealing') && question && (
        <>
          {error && (
            <div className="chip chip-red w-full px-4 py-3 text-sm">{error}</div>
          )}

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <span className="chip chip-blue">{question.concept}</span>
              <DifficultyBadge level={question.difficulty} />
            </div>

            <p className="text-base font-medium leading-relaxed text-black dark:text-[#F3F4F6]">
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((opt, i) => {
                let borderClass = 'border-[#E6F0FF] dark:border-[#1C2A4A]';
                let bgClass = 'bg-transparent hover:bg-slate-50 dark:hover:bg-[#121A2E]';
                let textClass = 'text-black dark:text-[#F3F4F6]';

                if (state === 'revealing' && answerResult) {
                  if (i === answerResult.correctAnswer) {
                    borderClass = 'border-[#22c55e]'; 
                    bgClass = 'bg-[#e6f7ee] dark:bg-[#0a2e1a]'; 
                    textClass = 'text-[#15803d] dark:text-[#4ade80]';
                  } else if (i === selectedOption && !answerResult.isCorrect) {
                    borderClass = 'border-[#ef4444]'; 
                    bgClass = 'bg-[#fdeaea] dark:bg-[#2e0f0f]'; 
                    textClass = 'text-[#dc2626] dark:text-[#f87171]';
                  }
                } else if (i === selectedOption) {
                  borderClass = 'border-[#004CE5]';
                  bgClass = 'bg-[#E6F0FF] dark:bg-[#0F1D3D]';
                  textClass = 'text-[#011A53] dark:text-[#8BB8FF]';
                }

                return (
                  <button
                    key={i}
                    id={`option-${i}`}
                    disabled={state === 'revealing'}
                    onClick={() => state === 'answering' && setSelectedOption(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 text-sm ${borderClass} ${bgClass} ${textClass}`}
                    style={{ cursor: state === 'revealing' ? 'default' : 'pointer' }}
                  >
                    <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {state === 'revealing' && answerResult && (
              <div className={`p-4 text-sm space-y-2 rounded-lg border-l-4 ${
                answerResult.isCorrect ? 'border-l-[#22c55e] bg-[#e6f7ee] dark:bg-[#0a2e1a]' : 'border-l-[#ef4444] bg-[#fdeaea] dark:bg-[#2e0f0f]'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {answerResult.isCorrect ? (
                    <span className="text-[#15803d] dark:text-[#4ade80]">Correct!</span>
                  ) : (
                    <span className="text-[#dc2626] dark:text-[#f87171]">Incorrect</span>
                  )}
                  <span className="font-normal text-xs ml-auto"
                    style={{ color: answerResult.masteryDelta >= 0 ? '#15803d' : '#dc2626' }}>
                    Mastery {answerResult.masteryDelta >= 0 ? '+' : ''}{answerResult.masteryDelta}%
                    &rarr; {answerResult.updatedMastery}%
                  </span>
                </div>
                <p className="text-black dark:text-[#F3F4F6]">{answerResult.explanation}</p>
              </div>
            )}

            {state === 'answering' && (
              <button
                id="submit-answer"
                disabled={selectedOption === null}
                onClick={handleSubmit}
                className="btn-primary w-full"
              >
                Submit Answer
              </button>
            )}
            {state === 'revealing' && (
              <div className="space-y-3">
                {questionsAnswered >= totalQuestions ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      id="view-results"
                      onClick={() => handleCompleteNavigation('/assessment/results', { sessionId, mode })}
                      className="btn-primary flex-1 font-bold text-sm py-3 text-center"
                    >
                      View Assessment Results &rarr;
                    </button>
                    <button
                      id="view-knowledge"
                      onClick={() => handleCompleteNavigation('/knowledge')}
                      className="btn-secondary flex-1 font-bold text-sm py-3 text-center"
                    >
                      View Knowledge Profile
                    </button>
                  </div>
                ) : (
                  <button
                    id="next-question"
                    onClick={handleNext}
                    className="btn-primary w-full"
                  >
                    Next Question &rarr;
                  </button>
                )}
              </div>
            )}
          </div>

          <WhyPanel reasoning={reasoning} open={whyOpen} onToggle={() => setWhyOpen(o => !o)} />
        </>
      )}

      {state === 'done' && (
        <div className="card text-center py-12 space-y-4">
          <h2 className="text-2xl font-extrabold">Assessment Complete</h2>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Redirecting to your results...</p>
          <div className="w-6 h-6 mx-auto border-2 border-[#004CE5] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
