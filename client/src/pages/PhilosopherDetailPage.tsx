import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/api';
import type { Quote } from '../lib/types';
import { useFavorites } from '../context/FavoritesContext';

export function PhilosopherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: philosopherResponse, isLoading: isLoadingPhilosopher } = useQuery({
    queryKey: ['philosopher', id],
    queryFn: () => apiClient.getPhilosopherById(id!),
    enabled: !!id,
  });

  const { data: quotesResponse, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes', 'philosopher', id],
    queryFn: () => apiClient.getQuotes(1, 50, undefined, id),
    enabled: !!id,
  });

  const philosopher = philosopherResponse?.data;
  const quotes = quotesResponse?.data || [];

  if (isLoadingPhilosopher) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-marble-200 rounded w-32 mb-8" />
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 h-48 bg-marble-200 rounded-full" />
              <div className="flex-1">
                <div className="h-8 bg-marble-200 rounded w-48 mb-4" />
                <div className="h-5 bg-marble-200 rounded w-32 mb-4" />
                <div className="h-4 bg-marble-200 rounded w-full mb-2" />
                <div className="h-4 bg-marble-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!philosopher) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif-cn text-2xl text-ink-900 mb-4">未找到哲学家</h2>
          <Link to="/philosophers" className="btn-classical">
            返回图鉴
          </Link>
        </div>
      </div>
    );
  }

  const formatYear = (year: number) => {
    if (year < 0) return `公元前${Math.abs(year)}年`;
    return `公元${year}年`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/philosophers"
          className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-700 transition-colors mb-8 no-underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          <span className="font-serif-cn text-sm">返回图鉴</span>
        </Link>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-8 mb-12"
        >
          {/* Portrait */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-marble-100 border-4 border-marble-200 mx-auto md:mx-0">
              <div className="w-full h-full flex items-center justify-center text-6xl text-ink-300 font-serif-en">
                {philosopher.nameEn.charAt(0)}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-serif-cn text-3xl md:text-4xl text-ink-900 mb-2">
              {philosopher.name}
            </h1>
            <p className="font-serif-en text-xl text-ink-500 mb-4">
              {philosopher.nameEn}
              {philosopher.nameGreek && (
                <span className="text-ink-400 ml-2">({philosopher.nameGreek})</span>
              )}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-sm text-ink-600">
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                {formatYear(philosopher.birthYear)} - {formatYear(philosopher.deathYear)}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {philosopher.region}
              </span>
            </div>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-serif-cn bg-marble-100 text-ink-600 rounded-full">
                {philosopher.school}
              </span>
            </div>

            {/* Core Ideas */}
            <div className="mb-6">
              <h3 className="font-serif-cn text-sm text-ink-500 mb-2">核心思想</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {philosopher.coreIdeas.map((idea, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-serif-cn bg-aegean-50 text-aegean-600 rounded-full"
                  >
                    {idea}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Biography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-classical p-8 mb-12"
        >
          <h2 className="font-serif-cn text-xl text-ink-900 mb-4">生平简介</h2>
          <p className="font-serif-cn text-ink-700 leading-relaxed whitespace-pre-line">
            {philosopher.biography}
          </p>
        </motion.div>

        {/* Quotes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-cn text-xl text-ink-900">
              语录合集 ({quotes.length}条)
            </h2>
          </div>

          {isLoadingQuotes ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-classical p-6 animate-pulse">
                  <div className="h-5 bg-marble-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-marble-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="card-classical p-8 text-center">
              <p className="font-serif-cn text-ink-400">暂无语录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote: Quote) => (
                <div
                  key={quote.id}
                  className="card-classical p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <blockquote className="mb-4">
                    <p className="font-serif-cn text-lg text-ink-800 leading-relaxed">
                      "{quote.content}"
                    </p>
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <span className="attribution text-sm">{quote.source}</span>
                    <button
                      onClick={() => toggleFavorite(quote.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite(quote.id)
                          ? 'text-terracotta-500 bg-terracotta-50'
                          : 'text-ink-400 hover:text-ink-600 hover:bg-marble-100'
                      }`}
                      aria-label={isFavorite(quote.id) ? '取消收藏' : '收藏'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isFavorite(quote.id) ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
