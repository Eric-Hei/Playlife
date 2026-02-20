import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Structures from './pages/Structures';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Ressources from './pages/Ressources';
import Contact from './pages/Contact';
import Impact from './pages/Impact';
import { CtaContact } from './components/CtaContact';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={setMobileMenuOpen}
      />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/structures" element={<Structures />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/ressources" element={<Ressources />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {window.location.pathname !== '/contact' && <CtaContact />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}