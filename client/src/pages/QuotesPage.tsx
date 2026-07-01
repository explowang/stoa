import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/api';
import type { Quote, Theme } from '../lib/types';
import { useFavorites } from '../context/FavoritesContext';

const themes = [
  { id: '', label: '全部' },
  { id: 'death', label: '死亡' },
  { id: 'happiness', label: '幸福' },
  { id: 'friendship', label: '友谊' },
  { id: 'self-knowledge', label: '自我认知' },
  { id: 'fate', label: '命运' },
  { id: 'virtue', label: '美德' },
  { id: 'wisdom', label: '智慧' },
  { id: 'justice', label: '正义' },
  { id: 'truth', label: '真理' },
  { id: 'education', label: '教育' },
];

export function QuotesPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | ''>('');
  const [page, setPage] = useState(1);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: response, isLoading } = useQuery({
    queryKey: ['quotes', page, selectedTheme],
    queryFn: () =>
      selectedTheme
        ? apiClient.getQuotesByTheme(selectedTheme as Theme, page, 10)
        : apiClient.getQuotes(page, 10, undefined),
  });

  const quotes = response?.data || [];
  const pagination = response?.pagination;

  const handleThemeChange = (theme: Theme | '') => {
    setSelectedTheme(theme);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif-cn text-3xl md:text-4xl text-ink-900 mb-4">
            语录合集
          </h1>
          <p className="font-serif-cn text-ink-500 max-w-2xl mx-auto">
            按主题探索古希腊哲学家的智慧
          </p>
        </div>

        {/* Theme Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id as Theme | '')}
              className={`px-4 py-2 rounded-full text-sm font-serif-cn transition-all duration-300 ${
                selectedTheme === theme.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-marble-100 text-ink-600 hover:bg-marble-200'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-classical p-8 animate-pulse">
                <div className="h-6 bg-marble-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-marble-200 rounded w-1/4 mb-6" />
                <div className="flex gap-2">
                  <div className="h-6 bg-marble-200 rounded-full w-16" />
                  <div className="h-6 bg-marble-200 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quotes List */}
        {!isLoading && (
          <motion.div
            className="space-y-6"
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
            {quotes.map((quote: Quote) => (
              <QuoteItem
                key={quote.id}
                quote={quote}
                isFavorite={isFavorite(quote.id)}
                onToggleFavorite={() => toggleFavorite(quote.id)}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && quotes.length === 0 && (
          <div className="card-classical p-12 text-center">
            <p className="font-serif-cn text-ink-400 text-lg">暂无语录</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-classical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="font-serif-cn text-ink-600">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="btn-classical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteItem({
  quote,
  isFavorite,
  onToggleFavorite,
}: {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const themeLabels: Record<string, string> = {
    death: '死亡',
    happiness: '幸福',
    friendship: '友谊',
    'self-knowledge': '自我认知',
    fate: '命运',
    virtue: '美德',
    wisdom: '智慧',
    justice: '正义',
    truth: '真理',
    education: '教育',
    politics: '政治',
    ethics: '伦理',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="card-classical p-8 hover:shadow-md transition-shadow duration-300"
    >
      {quote.imageUrl && (
        <div className="mb-6 aspect-video w-full">
          <img
            src={quote.imageUrl}
            alt={quote.content}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      )}

      <blockquote className="mb-6">
        <p className="font-serif-cn text-xl text-ink-800 leading-relaxed">
          "{quote.content}"
        </p>
      </blockquote>

      <div className="flex items-center justify-between mb-4">
        <span className="attribution text-sm">
          —— {quote.philosopher?.name || '未知'} {quote.source}
        </span>
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-full transition-colors ${
            isFavorite
              ? 'text-terracotta-500 bg-terracotta-50'
              : 'text-ink-400 hover:text-ink-600 hover:bg-marble-100'
          }`}
          aria-label={isFavorite ? '取消收藏' : '收藏'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? 'currentColor' : 'none'}
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

      {/* Themes */}
      {quote.themes && quote.themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quote.themes.map((theme) => (
            <span key={theme} className="tag-theme">
              {themeLabels[theme] || theme}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
