import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '../../lib/types';
import { useFavorites } from '../../context/FavoritesContext';

interface QuoteCardProps {
  quote: Quote;
  onNext?: () => void;
  showActions?: boolean;
}

export function QuoteCard({ quote, onNext, showActions = true }: QuoteCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = async () => {
    // Create a simple text share for now
    const text = `"${quote.content}"\n—— ${quote.philosopher?.name || '未知'} ${quote.source}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && onNext) {
      e.preventDefault();
      onNext();
    }
  };

  // Add keyboard listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const philosopher = quote.philosopher;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Image */}
          {quote.imageUrl && (
            <div className="mb-8">
              <img
                src={quote.imageUrl}
                alt={quote.content}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          )}

          {/* Quote Content */}
          <blockquote className="mb-8">
            <p className="quote-text text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-6">
              "{quote.content}"
            </p>
            
            {quote.contentOriginal && (
              <p className="quote-text-en text-lg md:text-xl text-ink-400 mb-6">
                {quote.contentOriginal}
              </p>
            )}
          </blockquote>

          {/* Attribution */}
          <div className="attribution text-base md:text-lg mb-2">
            —— {philosopher?.name || '未知'}
            {philosopher?.nameEn && (
              <span className="text-ink-400 ml-2">({philosopher.nameEn})</span>
            )}
          </div>
          <div className="attribution text-sm text-ink-400 mb-12">
            {quote.source}
          </div>

          {/* Themes */}
          {quote.themes && quote.themes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {quote.themes.map((theme) => (
                <span key={theme} className="tag-theme">
                  {getThemeLabel(theme)}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-center gap-6">
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(quote.id)}
                className={`btn-classical-ghost flex items-center gap-2 ${
                  isFavorite(quote.id) ? 'text-terracotta-500' : ''
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
                <span className="font-serif-cn text-sm">
                  {isFavorite(quote.id) ? '已收藏' : '收藏'}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="btn-classical-ghost flex items-center gap-2"
                aria-label="分享"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
                <span className="font-serif-cn text-sm">分享</span>
              </button>

              {/* Next Button */}
              {onNext && (
                <button
                  onClick={onNext}
                  className="btn-classical flex items-center gap-2"
                  aria-label="下一句"
                >
                  <span className="font-serif-cn text-sm">下一句</span>
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
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Keyboard hint */}
          {onNext && (
            <p className="text-ink-300 text-xs mt-6 font-sans">
              按空格键切换下一句
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getThemeLabel(theme: string): string {
  const labels: Record<string, string> = {
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
    metaphysics: '形而上学',
    logic: '逻辑',
    nature: '自然',
    time: '时间',
    knowledge: '知识',
    courage: '勇气',
    moderation: '节制',
    purpose: '目的',
  };
  return labels[theme] || theme;
}
