import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (quoteId: string) => void;
  removeFavorite: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  toggleFavorite: (quoteId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'stoa-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (quoteId: string) => {
    setFavorites((prev) => {
      if (prev.includes(quoteId)) return prev;
      return [...prev, quoteId];
    });
  };

  const removeFavorite = (quoteId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== quoteId));
  };

  const isFavorite = (quoteId: string) => favorites.includes(quoteId);

  const toggleFavorite = (quoteId: string) => {
    if (isFavorite(quoteId)) {
      removeFavorite(quoteId);
    } else {
      addFavorite(quoteId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
