import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from './context/FavoritesContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { PhilosophersPage } from './pages/PhilosophersPage';
import { PhilosopherDetailPage } from './pages/PhilosopherDetailPage';
import { QuotesPage } from './pages/QuotesPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-cream">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/philosophers" element={<PhilosophersPage />} />
                <Route path="/philosophers/:id" element={<PhilosopherDetailPage />} />
                <Route path="/quotes" element={<QuotesPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

export default App;
