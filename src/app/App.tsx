import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResourceGrid } from './components/ResourceGrid';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={setMobileMenuOpen}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-22' : 'lg:ml-64'}`}>
        <Header />
        <main>
          <ResourceGrid />
        </main>
      </div>
    </div>
  );
}