import { useState } from 'react';
import { Search } from 'lucide-react';

const subjects = [
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Arabic',
  'Economics',
  'Business Studies',
  'Computer Science',
  'Statistics',
  'Science',
  'Psychology',
  'French',
  'Creative Writing',
  'Languages',
];

const curricula = [
  'IGCSE',
  'IB',
  'A-Level',
  'American Curriculum',
  'CBSE',
];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const selectClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 text-base appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#205072]/30 focus:border-[#205072]';

const SearchSubjectCirricula = () => {
  const [subject, setSubject] = useState('');
  const [curriculum, setCurriculum] = useState('');

  const handleSearch = () => {
    const parts: string[] = [];
    if (subject) parts.push(toSlug(subject));
    if (curriculum) parts.push(toSlug(curriculum));
    window.location.hash = parts.length
      ? `${parts.join('-')}-tutors`
      : 'subjects';
  };

  return (
    <section className="home-section home-section-spacing relative z-20">
      <div className="home-section-inner">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <form
          className="flex flex-col md:flex-row gap-4 md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="flex-1 min-w-0">
            <label
              htmlFor="search-subject"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Subject
            </label>
            <select
              id="search-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={selectClass}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">Select a subject</option>
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label
              htmlFor="search-curriculum"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Curricula
            </label>
            <select
              id="search-curriculum"
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              className={selectClass}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">Select a curriculum</option>
              {curricula.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#205072] hover:bg-[#24bcc7] text-white font-medium rounded-xl px-6 py-3.5 md:py-3.5 transition-colors w-full md:w-auto md:min-w-[3.5rem] md:px-5"
            aria-label="Search tutors"
          >
            <Search className="h-5 w-5" strokeWidth={2.5} />
            <span className="md:hidden">Search</span>
          </button>
        </form>
        </div>
      </div>
    </section>
  );
};

export default SearchSubjectCirricula;
