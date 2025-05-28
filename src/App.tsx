
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";

const queryClient = new QueryClient();

// Composant de redirection basé sur l'authentification
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirection vers un dashboard simple pour l'instant
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center text-4xl ${
          user.userType === 'humoriste' 
            ? 'bg-gradient-to-r from-pink-500 to-red-500' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}>
          {user.userType === 'humoriste' ? '🎤' : '🎪'}
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4">
          Bienvenue {user.firstName} ! 🎉
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          {user.userType === 'humoriste' 
            ? 'Ton dashboard humoriste arrive bientôt !' 
            : 'Ton dashboard organisateur arrive bientôt !'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-lg font-semibold text-white">Score Viral</div>
            <div className="text-2xl font-bold text-pink-400">{user.stats.viralScore}</div>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">🎭</div>
            <div className="text-lg font-semibold text-white">Événements</div>
            <div className="text-2xl font-bold text-cyan-400">{user.stats.totalEvents}</div>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-lg font-semibold text-white">Note moyenne</div>
            <div className="text-2xl font-bold text-yellow-400">{user.stats.averageRating}/5</div>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('standup_token');
            window.location.href = '/';
          }}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

// Composant de protection des routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
