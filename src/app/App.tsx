import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Structures from './pages/Structures';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={setSidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          onMobileToggle={setMobileMenuOpen}
        />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-22' : 'lg:ml-64'}`}>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/structures" element={<Structures />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}