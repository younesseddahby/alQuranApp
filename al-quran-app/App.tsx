import React, { useState, useCallback, useEffect } from 'react';
import QuranReader from './components/QuranReader';
import QuranListener from './components/QuranListener';
import AdhanTimes from './components/AdhanTimes';
import SettingsModal from './components/SettingsModal';
import { BookOpenIcon, SpeakerWaveIcon, PrayerTimeIcon, SettingsIcon } from './components/Icons';

type Tab = 'read' | 'listen' | 'adhan';
type Theme = 'light' | 'dark';
type Color = 'teal' | 'blue' | 'rose' | 'amber' | 'violet';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('read');
  const [theme, setTheme] = useState<Theme>('light');
  const [themeColor, setThemeColor] = useState<Color>('teal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'read':
        return <QuranReader themeColor={themeColor} />;
      case 'listen':
        return <QuranListener themeColor={themeColor} />;
      case 'adhan':
        return <AdhanTimes themeColor={themeColor} />;
      default:
        return <QuranReader themeColor={themeColor} />;
    }
  }, [activeTab, themeColor]);

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: JSX.Element }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-${themeColor}-500 ${
        activeTab === tabName
          ? `bg-${themeColor}-600 text-white shadow-md`
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-10">
            <div className="text-left">
                 <h1 className={`text-4xl sm:text-5xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400 font-amiri tracking-wide`}>
                    Al Quran App
                </h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                    Your daily source for spiritual reflection.
                </p>
            </div>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-${themeColor}-600 dark:hover:text-${themeColor}-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-500`}
                aria-label="Open settings"
            >
                <SettingsIcon />
            </button>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <TabButton tabName="read" label="Read Quran" icon={<BookOpenIcon />} />
              <TabButton tabName="listen" label="Listen Quran" icon={<SpeakerWaveIcon />} />
              <TabButton tabName="adhan" label="Adhan Times" icon={<PrayerTimeIcon />} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>

        <footer className="text-center mt-12">
            <button
                onClick={() => setIsSettingsOpen(true)}
                className={`px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-${themeColor}-500`}
            >
                Made with <span className="text-rose-500 mx-1">❤️</span> by YNS-DHB
            </button>
        </footer>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
      />
      {/* Tailwind JIT Safelist */}
      <div className="hidden">
        <span className="bg-teal-600 hover:bg-teal-700 text-teal-600 dark:text-teal-400 text-teal-700 dark:text-teal-300 ring-teal-500 focus:ring-teal-500 border-teal-500 focus:border-teal-500 hover:border-teal-500 border-t-teal-600 dark:border-t-teal-400 bg-teal-100 dark:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 border-teal-600"></span>
        <span className="bg-blue-600 hover:bg-blue-700 text-blue-600 dark:text-blue-400 text-blue-700 dark:text-blue-300 ring-blue-500 focus:ring-blue-500 border-blue-500 focus:border-blue-500 hover:border-blue-500 border-t-blue-600 dark:border-t-blue-400 bg-blue-100 dark:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 border-blue-600"></span>
        <span className="bg-rose-600 hover:bg-rose-700 text-rose-600 dark:text-rose-400 text-rose-700 dark:text-rose-300 ring-rose-500 focus:ring-rose-500 border-rose-500 focus:border-rose-500 hover:border-rose-500 border-t-rose-600 dark:border-t-rose-400 bg-rose-100 dark:bg-rose-900 hover:text-rose-600 dark:hover:text-rose-400 border-rose-600"></span>
        <span className="bg-amber-600 hover:bg-amber-700 text-amber-600 dark:text-amber-400 text-amber-700 dark:text-amber-300 ring-amber-500 focus:ring-amber-500 border-amber-500 focus:border-amber-500 hover:border-amber-500 border-t-amber-600 dark:border-t-amber-400 bg-amber-100 dark:bg-amber-900 hover:text-amber-600 dark:hover:text-amber-400 border-amber-600"></span>
        <span className="bg-violet-600 hover:bg-violet-700 text-violet-600 dark:text-violet-400 text-violet-700 dark:text-violet-300 ring-violet-500 focus:ring-violet-500 border-violet-500 focus:border-violet-500 hover:border-violet-500 border-t-violet-600 dark:border-t-violet-400 bg-violet-100 dark:bg-violet-900 hover:text-violet-600 dark:hover:text-violet-400 border-violet-600"></span>
      </div>
    </div>
  );
};

export default App;