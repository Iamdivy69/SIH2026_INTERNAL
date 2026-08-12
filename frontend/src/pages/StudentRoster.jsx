import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentRoster() {
  const { authHeader, API } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('lastActive');

  const fetchRoster = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

      const res = await fetch(`${API}/api/admin/students?${params.toString()}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to load roster.'); return; }
      setStudents(data.students);
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoster();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sort]);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black dark:text-[#F3F4F6]">Student Roster</h1>
          <p className="text-sm mt-1 text-[#64748B] dark:text-[#94A3B8]">
            Search, inspect, and monitor all student performance profiles and proctoring flags
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search student name or email..."
            className="input w-64 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input text-sm w-44"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="lastActive">Sort by Last Active</option>
            <option value="mastery">Sort by Mastery</option>
            <option value="violations">Sort by Violations</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-12 justify-center">
          <div className="w-6 h-6 border-2 border-[#004CE5] border-t-transparent animate-spin" />
          <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Loading student roster...</span>
        </div>
      )}
      {error && <p className="text-[#dc2626] dark:text-[#f87171] text-sm">{error}</p>}

      {!loading && students.length === 0 && (
        <div className="card text-center py-12 space-y-2">
          <p className="font-bold text-lg text-black dark:text-[#F3F4F6]">No students found</p>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Try adjusting your search query or filters.</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="card p-0 overflow-hidden border border-[#E6F0FF] dark:border-[#1C2A4A]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E6F0FF] dark:border-[#1C2A4A] bg-[#F8FAFF] dark:bg-[#0D1325] text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  <th className="p-4">Student</th>
                  <th className="p-4">Overall Mastery</th>
                  <th className="p-4">Completed Tests</th>
                  <th className="p-4">Violations</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6F0FF] dark:divide-[#1C2A4A]">
                {students.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => navigate(`/admin/students/${st.id}`)}
                    className="hover:bg-[#F8FAFF] dark:hover:bg-[#151D33] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-black dark:text-[#F3F4F6]">{st.name}</div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{st.email}</div>
                    </td>
                    <td className="p-4 font-bold tabular-nums">
                      <span className={st.overallMastery >= 70 ? 'text-[#15803d] dark:text-[#4ade80]' : st.overallMastery >= 40 ? 'text-[#a16207] dark:text-[#facc15]' : 'text-[#dc2626] dark:text-[#f87171]'}>
                        {st.overallMastery}%
                      </span>
                    </td>
                    <td className="p-4 tabular-nums text-black dark:text-[#F3F4F6]">{st.assessmentsCompleted}</td>
                    <td className="p-4 tabular-nums">
                      <span className={st.totalViolations > 0 ? 'text-[#dc2626] dark:text-[#f87171] font-bold' : 'text-[#64748B] dark:text-[#94A3B8]'}>
                        {st.totalViolations}
                      </span>
                    </td>
                    <td className="p-4">
                      {st.flagged ? (
                        <span className="chip chip-red font-semibold">
                          Flagged (High Violations)
                        </span>
                      ) : (
                        <span className="chip chip-green font-semibold">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {formatDate(st.lastActiveAt)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/students/${st.id}`);
                        }}
                        className="text-xs font-bold text-[#004CE5] hover:underline"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
