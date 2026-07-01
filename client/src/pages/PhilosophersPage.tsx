import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/api';
import type { Philosopher } from '../lib/types';

const schools = [
  { id: '', label: '全部' },
  { id: '苏格拉底学派', label: '苏格拉底学派' },
  { id: '柏拉图学派', label: '柏拉图学派' },
  { id: '逍遥学派', label: '逍遥学派' },
  { id: '犬儒学派', label: '犬儒学派' },
  { id: '斯多亚学派', label: '斯多亚学派' },
  { id: '伊壁鸠鲁学派', label: '伊壁鸠鲁学派' },
];

export function PhilosophersPage() {
  const [selectedSchool, setSelectedSchool] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['philosophers', selectedSchool],
    queryFn: () => apiClient.getPhilosophers(selectedSchool || undefined),
  });

  const philosophers = response?.data || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif-cn text-3xl md:text-4xl text-ink-900 mb-4">
            哲学家图鉴
          </h1>
          <p className="font-serif-cn text-ink-500 max-w-2xl mx-auto">
            走进西方哲学的奠基者们，了解他们的思想与智慧
          </p>
        </div>

        {/* School Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => setSelectedSchool(school.id)}
              className={`px-4 py-2 rounded-full text-sm font-serif-cn transition-all duration-300 ${
                selectedSchool === school.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-marble-100 text-ink-600 hover:bg-marble-200'
              }`}
            >
              {school.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-classical p-6 animate-pulse">
                <div className="w-24 h-24 mx-auto mb-4 bg-marble-200 rounded-full" />
                <div className="h-5 bg-marble-200 rounded w-20 mx-auto mb-2" />
                <div className="h-4 bg-marble-200 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Philosophers Grid */}
        {!isLoading && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {philosophers.map((philosopher) => (
              <PhilosopherCard key={philosopher.id} philosopher={philosopher} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && philosophers.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif-cn text-ink-400">暂无哲学家数据</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PhilosopherCard({ philosopher }: { philosopher: Philosopher }) {
  const lifespan = formatLifespan(philosopher.birthYear, philosopher.deathYear);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/philosophers/${philosopher.id}`}
        className="block card-classical p-6 text-center no-underline group"
      >
        {/* Portrait */}
        <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-marble-100 border-2 border-marble-200 group-hover:border-ink-300 transition-colors duration-300">
          <div className="w-full h-full flex items-center justify-center text-4xl text-ink-300 font-serif-en">
            {philosopher.nameEn.charAt(0)}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-serif-cn text-lg text-ink-900 mb-1">
          {philosopher.name}
        </h3>
        <p className="font-serif-en text-sm text-ink-500 mb-2">
          {philosopher.nameEn}
        </p>

        {/* Lifespan */}
        <p className="font-sans text-xs text-ink-400 mb-3">{lifespan}</p>

        {/* School */}
        <span className="inline-block px-3 py-1 text-xs font-serif-cn bg-marble-100 text-ink-600 rounded-full">
          {philosopher.school}
        </span>
      </Link>
    </motion.div>
  );
}

function formatLifespan(birth: number, death: number): string {
  const formatYear = (year: number) => {
    if (year < 0) return `公元前${Math.abs(year)}年`;
    return `公元${year}年`;
  };
  return `${formatYear(birth)} - ${formatYear(death)}`;
}
