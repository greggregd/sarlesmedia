
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onReset: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onReset }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onReset}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <i className="fas fa-camera-retro text-white text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                LuminaShot AI
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                OCVTS Multimedia
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Brick Campus</span>
            <button 
              onClick={onReset}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              Start Free
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-900 font-bold mb-1">OCVTS Intro to Multimedia</p>
              <p className="text-gray-500 text-sm">Instructor: Mr. Sarles</p>
              <p className="text-gray-400 text-xs mt-2">Ocean County Vocational Technical School, Brick, NJ</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} LuminaShot AI. <br className="md:hidden" />
                Designed for educational excellence.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
