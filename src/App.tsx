import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { useAuthStore } from './store/authStore';

// Заглушка для будущего чата
const ChatPlaceholder = () => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Чат</h1>
      <button onClick={logout} className="mt-4 text-red-500 underline">
        Выйти
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPlaceholder />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;