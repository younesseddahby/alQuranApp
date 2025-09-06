import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SurahInfo, FullSurahAudio, AyahAudio } from '../types';
import Spinner from './Spinner';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons';

interface QuranListenerProps {
  themeColor: string;
}

const reciters = [
    { identifier: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { identifier: 'ar.abdulsamad', name: 'Abdul Basit Abdul Samad' },
    { identifier: 'ar.ahmedajamy', name: 'Ahmed Al Ajmi' },
    { identifier: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
    { identifier: 'ar.mahermuaiqly', name: 'Maher Al Muaqily' },
];

const QuranListener: React.FC<QuranListenerProps> = ({ themeColor }) => {
    const [surahs, setSurahs] = useState<SurahInfo[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<FullSurahAudio | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    const [loadingRecitation, setLoadingRecitation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
    const audioRef = useRef<HTMLAudioElement>(null);
    const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const fetchSurahList = async () => {
            try {
                setLoadingSurahs(true);
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

    const fetchSurahRecitation = useCallback(async (surahNumber: number) => {
        window.scrollTo(0, 0);
        try {
            setLoadingRecitation(true);
            setError(null);
            setIsPlaying(false);
            setCurrentAyahIndex(0);

            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.asad,${selectedReciter}`);
            if (!response.ok) throw new Error('Failed to fetch Surah data.');
            const data = await response.json();

            const arabicData = data.data[0];
            const englishData = data.data[1];
            const audioData = data.data[2];

            const combinedAyahs: AyahAudio[] = arabicData.ayahs.map((ayah: any, index: number) => ({
                number: ayah.number,
                text: ayah.text,
                numberInSurah: ayah.numberInSurah,
                englishText: englishData.ayahs[index].text,
                audio: audioData.ayahs[index].audio,
            }));

            setSelectedSurah({
                number: arabicData.number,
                name: arabicData.name,
                englishName: arabicData.englishName,
                ayahs: combinedAyahs,
            });
            ayahRefs.current = [];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoadingRecitation(false);
        }
    }, [selectedReciter]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !selectedSurah) return;

        if (isPlaying) {
            audio.src = selectedSurah.ayahs[currentAyahIndex].audio;
            audio.play().catch(e => {
                console.error("Audio play failed:", e);
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentAyahIndex, selectedSurah]);
    
    useEffect(() => {
        if (isPlaying && ayahRefs.current[currentAyahIndex]) {
            ayahRefs.current[currentAyahIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentAyahIndex, isPlaying]);

    const handlePlayPause = () => {
        if (!selectedSurah) return;
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (selectedSurah && currentAyahIndex < selectedSurah.ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
        } else {
            setIsPlaying(false);
        }
    };

    const handlePrevious = () => {
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
        }
    };

    const handleMuteToggle = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !audio.muted;
            setIsMuted(audio.muted);
        }
    };

    const handleGoBack = () => {
        setIsPlaying(false);
        setSelectedSurah(null);
        setError(null);
        setCurrentAyahIndex(0);
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        }
    };

    const handleAudioEnded = () => {
        handleNext();
    };

    const filteredSurahs = surahs.filter(surah =>
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name.includes(searchQuery) ||
        surah.number.toString().includes(searchQuery)
    );

    if (loadingRecitation) {
        return <Spinner text="Loading Recitation..." themeColor={themeColor} />;
    }

    if (selectedSurah) {
        const currentReciter = reciters.find(r => r.identifier === selectedReciter);
        return (
            <div className="space-y-6">
                 <div className="flex justify-between items-center mb-4">
                    <button onClick={handleGoBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        &larr; Back to Surah List
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => fetchSurahRecitation(selectedSurah.number - 1)} 
                            disabled={selectedSurah.number === 1}
                            className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-md hover:bg-${themeColor}-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}>
                            Previous Surah
                        </button>
                        <button 
                            onClick={() => fetchSurahRecitation(selectedSurah.number + 1)} 
                            disabled={selectedSurah.number === 114}
                            className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-md hover:bg-${themeColor}-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600`}>
                            Next Surah
                        </button>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-6 z-10">
                        <div className="text-center mb-4">
                            <h3 className="text-2xl font-bold font-amiri text-gray-900 dark:text-white">{selectedSurah.englishName} - {selectedSurah.name}</h3>
                            <p className={`text-md text-gray-600 dark:text-gray-400 mt-1`}>Recitation by {currentReciter?.name || 'Unknown'}</p>
                        </div>
                        <div className="flex items-center justify-center space-x-4">
                            <button onClick={handlePrevious} disabled={currentAyahIndex === 0} className={`p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}>
                                <BackwardIcon />
                            </button>
                            <button onClick={handlePlayPause} className={`w-16 h-16 bg-${themeColor}-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-${themeColor}-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-500`}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button onClick={handleNext} disabled={currentAyahIndex === selectedSurah.ayahs.length - 1} className={`p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}>
                                <ForwardIcon />
                            </button>
                             <button onClick={handleMuteToggle} className={`p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}>
                                {isMuted ? <SpeakerXMarkIcon /> : <SpeakerWaveIcon className="h-6 w-6" />}
                            </button>
                        </div>
                        <audio ref={audioRef} onEnded={handleAudioEnded} />
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedSurah.ayahs.map((ayah, index) => (
                             <div 
                                key={ayah.number} 
                                // FIX: The ref callback should not return a value. Using a block body for the arrow function to prevent an implicit return.
                                ref={el => { ayahRefs.current[index] = el; }}
                                className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${index === currentAyahIndex && isPlaying ? `bg-${themeColor}-100 dark:bg-gray-700/80 scale-105 shadow-lg border-${themeColor}-600` : `bg-gray-50 dark:bg-gray-900/50 border-${themeColor}-500`}`}>
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
            <h2 className={`text-3xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400 font-amiri`}>Listen to Quran</h2>
            
            {error && <p className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">{error}</p>}
            
            {loadingSurahs ? (
                <Spinner text="Loading Surahs..." themeColor={themeColor} />
            ) : (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label htmlFor="search-surah" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Surah</label>
                           <input
                                id="search-surah"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or number..."
                                className={`block w-full pl-4 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                            />
                       </div>
                       <div>
                            <label htmlFor="reciter-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reciter</label>
                            <select
                                id="reciter-select"
                                value={selectedReciter}
                                onChange={(e) => setSelectedReciter(e.target.value)}
                                className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                            >
                                {reciters.map((reciter) => (
                                    <option key={reciter.identifier} value={reciter.identifier}>
                                        {reciter.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
                        {filteredSurahs.map((surah) => (
                            <div
                                key={surah.number}
                                onClick={() => fetchSurahRecitation(surah.number)}
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

export default QuranListener;