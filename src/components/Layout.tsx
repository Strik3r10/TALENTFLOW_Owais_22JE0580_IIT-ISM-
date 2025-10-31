import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scroll, Shield, Menu, X, Swords, Castle, FileText } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Castle Hall', href: '/', icon: Castle, exact: true },
    { name: 'Job Board', href: '/jobs', icon: Scroll },
    { name: 'Candidates', href: '/candidates', icon: Shield },
    { name: 'Assessments', href: '/assessments', icon: FileText },
    { name: 'Pipeline', href: '/pipeline', icon: Swords },
  ];

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-castle-wall">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gold" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blood-red rounded-full flex items-center justify-center shadow-wax-seal">
                  <span className="text-gold font-medieval font-bold text-xl">⚔️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-medieval font-bold text-gold text-shadow-gold">TalentFlow</h1>
                  <p className="text-xs font-body text-gold-light">Royal Recruitment Hall</p>
                </div>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-2">
              {navigation.map((item) => {
                const isActive = item.exact 
                  ? location.pathname === item.href
                  : location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gold text-castle-stone shadow-embossed'
                        : 'text-gold hover:bg-castle-stone-light hover:text-gold-light'
                    } group flex items-center px-3 py-3 text-base font-medieval font-semibold rounded-md transition-all duration-200`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t-2 border-gold-dark p-4">
            <p className="text-xs text-gold-light font-body text-center italic">
              "For Honor and Glory"
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow border-r-4 border-gold-trim bg-castle-wall shadow-lg overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-5 mb-8">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-14 bg-blood-red rounded-full flex items-center justify-center shadow-wax-seal">
                <span className="text-gold font-medieval font-bold text-2xl">⚔️</span>
              </div>
              <div>
                <h1 className="text-2xl font-medieval font-bold text-gold text-shadow-gold">TalentFlow</h1>
                <p className="text-xs font-body text-gold-light">Royal Recruitment Hall</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-2">
            {navigation.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-gold text-castle-stone shadow-embossed'
                      : 'text-gold hover:bg-castle-stone-light hover:text-gold-light'
                  } group flex items-center px-3 py-3 text-sm font-medieval font-semibold rounded-md transition-all duration-200`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t-2 border-gold-dark p-4">
            <p className="text-xs text-gold-light font-body text-center italic">
              "For Honor and Glory"
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-72">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-parchment">
          <button
            type="button"
            className="h-12 w-12 inline-flex items-center justify-center rounded-md text-castle-stone hover:bg-parchment-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
