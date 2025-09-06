import React, { useState, useEffect, useCallback } from 'react';
import type { SurahInfo, FullSurahText, AyahText } from '../types';
import Spinner from './Spinner';

interface QuranReaderProps {
  themeColor: string;
}

const QuranReader: React.FC<QuranReaderProps> = ({ themeColor }) => {
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<FullSurahText | null>(null);
  const [loadingSurahs, setLoadingSurahs] = useState<boolean>(true);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all surahs for the grid view
  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        setLoadingSurahs(true);
        setError(null);
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        if (!response.ok) throw new Error('Failed to fetch Surah list.');
        const data = await response.json();
        setSurahs(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoadingSurahs(false);
      }
    };
    fetchSurahList();
  }, []);

  // Fetch content for a selected surah
  const fetchSurahContent = useCallback(async (surahNumber: number) => {
    // Scroll to top when a new surah is fetched
    window.scrollTo(0, 0);
    try {
      setLoadingAyahs(true);
      setError(null);
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.asad`);
      if (!response.ok) throw new Error(`Failed to fetch content for Surah ${surahNumber}.`);
      const data = await response.json();
      const arabicText = data.data[0];
      const englishText = data.data[1];

      const combinedAyahs = arabicText.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        englishText: englishText.ayahs[index].text,
      }));

      setSelectedSurah({
        number: arabicText.number,
        name: arabicText.name,
        englishName: arabicText.englishName,
        ayahs: combinedAyahs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoadingAyahs(false);
    }
  }, []);

  const handleGoBack = () => {
    setSelectedSurah(null);
    setError(null);
  };

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.name.includes(searchQuery) ||
    surah.number.toString().includes(searchQuery)
  );

  if (loadingAyahs) {
    return <Spinner text="Loading Ayahs..." themeColor={themeColor} />;
  }

  if (selectedSurah) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
            <button onClick={handleGoBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                &larr; Back to Surah List
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={() => fetchSurahContent(selectedSurah.number - 1)} 
                    disabled={selectedSurah.number === 1}
                    className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-md hover:bg-${themeColor}-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}>
                    Previous Surah
                </button>
                <button 
                    onClick={() => fetchSurahContent(selectedSurah.number + 1)} 
                    disabled={selectedSurah.number === 114}
                    className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-md hover:bg-${themeColor}-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}>
                    Next Surah
                </button>
            </div>
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold font-amiri text-gray-900 dark:text-white">{selectedSurah.name}</h3>
            <p className={`text-2xl text-${themeColor}-600 dark:text-${themeColor}-400`}>{selectedSurah.englishName}</p>
          </div>
          <div className="space-y-8">
            {selectedSurah.ayahs.map((ayah: AyahText & { englishText: string }) => (
              <div key={ayah.number} className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-l-4 border-${themeColor}-500`}>
                <p className="text-right text-3xl font-amiri leading-loose mb-4 text-gray-800 dark:text-gray-200">
                  {ayah.text} <span className={`text-xs px-2 py-1 bg-${themeColor}-100 dark:bg-${themeColor}-900 text-${themeColor}-700 dark:text-${themeColor}-300 rounded-full`}>{ayah.numberInSurah}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  {ayah.englishText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400 font-amiri`}>Read Quran</h2>
      
      {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
      
      {loadingSurahs ? (
        <Spinner text="Loading Surahs..." themeColor={themeColor} />
      ) : (
        <>
          <div className="relative">
             <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Surah by name or number..."
                className={`block w-full pl-4 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
              />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
             {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => fetchSurahContent(surah.number)}
                className={`bg-white dark:bg-gray-800/50 rounded-lg shadow p-2 cursor-pointer hover:shadow-xl hover:border-${themeColor}-500 border-2 border-transparent transition-all duration-200 flex flex-col items-center text-center`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2">
                    <span className="font-bold text-sm text-blue-700 dark:text-blue-300">{surah.number}</span>
                </div>
                <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-gray-100">{surah.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{surah.englishName}</p>
                <p className="text-xs text-gray-500 mt-1">{surah.numberOfAyahs} آية</p>
              </div>
            ))}
            {filteredSurahs.length === 0 && <p className="text-center text-gray-500 col-span-full">No Surahs found.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default QuranReader;