import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Quote, Theme } from '../lib/types';
import { QuoteCard } from '../components/quote/QuoteCard';

export function HomePage() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const { data: response, refetch, isLoading } = useQuery({
    queryKey: ['quote', 'random'],
    queryFn: () => apiClient.getRandomQuote(),
  });

  useEffect(() => {
    if (response?.data) {
      setCurrentQuote(response.data);
    }
  }, [response]);

  const handleNext = () => {
    refetch();
  };

  // Loading state
  if (isLoading && !currentQuote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif-cn text-ink-400">正在加载...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentQuote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif-cn text-ink-400 text-lg mb-4">暂无语录</p>
          <button onClick={handleNext} className="btn-classical">
            重试
          </button>
        </div>
      </div>
    );
  }

  return <QuoteCard quote={currentQuote} onNext={handleNext} />;
}
