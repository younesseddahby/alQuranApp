import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PrayerTimeData } from '../types';
import Spinner from './Spinner';

interface AdhanTimesProps {
  themeColor: string;
}

const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

type SearchMode = 'city' | 'coordinates';

const AdhanTimes: React.FC<AdhanTimesProps> = ({ themeColor }) => {
  const [location, setLocation] = useState<{ city: string; country: string } | { lat: number; lon: number }>({ city: 'Casablanca', country: 'Morocco' });
  const [inputLocation, setInputLocation] = useState({ city: 'Casablanca', country: 'Morocco' });
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPrayer, setHighlightedPrayer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchMode, setSearchMode] = useState<SearchMode>('city');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setCitySuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  const fetchPrayerTimes = useCallback(async (loc: typeof location) => {
    setLoading(true);
    setError(null);
    let url = '';
    if ('city' in loc) {
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(loc.city)}&country=${encodeURIComponent(loc.country)}&method=2`;
    } else {
      url = `https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lon}&method=2`;
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Could not fetch prayer times. Please check your input.');
      }
      const data = await response.json();
      if (data.code !== 200) {
        throw new Error(data.data || 'An error occurred while fetching prayer times.');
      }
      setPrayerTimes(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setPrayerTimes(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrayerTimes(location);
  }, [location, fetchPrayerTimes]);
  
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes?.timings) {
      const now = new Date();
      
      const createDateFromTimeString = (timeStr: string): Date => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
      };
      
      const prayerStartTimes = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const prayerDates = prayerStartTimes.map(name => ({
          name,
          date: createDateFromTimeString(prayerTimes.timings[name])
      }));

      let activePrayerIndex = -1;
      for (let i = prayerDates.length - 1; i >= 0; i--) {
        if (prayerDates[i].date <= now) {
          activePrayerIndex = i;
          break;
        }
      }

      if (activePrayerIndex !== -1) {
        setHighlightedPrayer(prayerDates[activePrayerIndex].name);
      } else {
        setHighlightedPrayer('Fajr');
      }
    }
  }, [prayerTimes, currentTime]);

    useEffect(() => {
        if (inputLocation.city.length < 2) {
            setCitySuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsSuggestionsLoading(true);
            try {
                // Using OpenStreetMap Nominatim API - it's public, reliable, and doesn't require a key.
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputLocation.city)}&format=json&addressdetails=1&limit=10`);
                if (!response.ok) {
                    throw new Error('Failed to fetch city suggestions from Nominatim API.');
                }
                const data = await response.json();
                // Filter for results that are likely cities or towns for relevance.
                const filteredData = data.filter((item: any) => 
                    ['city', 'town', 'village', 'hamlet'].includes(item.type) && item.address?.country
                );
                setCitySuggestions(filteredData);
            } catch (error) {
                console.error("Failed to fetch city suggestions", error);
                setCitySuggestions([]);
            } finally {
                setIsSuggestionsLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [inputLocation.city]);
    
  const handleSuggestionClick = (suggestion: any) => {
      // Nominatim provides a structured address object.
      const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.name;
      const country = suggestion.address.country;
      if (city && country) {
          setInputLocation({ city, country });
      }
      setCitySuggestions([]); // Hide suggestions after selection
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'city') {
        setLocation(inputLocation);
    } else {
        const lat = parseFloat(coordinates.lat);
        const lon = parseFloat(coordinates.lon);
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            setError('Invalid coordinates. Latitude must be between -90 and 90, and Longitude between -180 and 180.');
            return;
        }
        setLocation({ lat, lon });
    }
  };

  const formatTime = (time: string) => {
    if(!time) return '';
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${suffix}`;
  };
  
  const locationDisplay = () => {
    if ('city' in location) {
        return `${location.city}, ${location.country}`;
    }
    return `Lat: ${location.lat.toFixed(2)}, Lon: ${location.lon.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400 font-amiri`}>Adhan & Prayer Times</h2>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-4">
        <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
            <button onClick={() => setSearchMode('city')} className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${searchMode === 'city' ? `bg-white dark:bg-gray-700 text-${themeColor}-600 shadow` : 'text-gray-500'}`}>
                Search by City
            </button>
            <button onClick={() => setSearchMode('coordinates')} className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${searchMode === 'coordinates' ? `bg-white dark:bg-gray-700 text-${themeColor}-600 shadow` : 'text-gray-500'}`}>
                Search by Coordinates
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            {searchMode === 'city' ? (
                <>
                    <div className="flex-1 w-full relative" ref={wrapperRef}>
                        <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                        <input
                            id="city-input"
                            type="text"
                            value={inputLocation.city}
                            onChange={(e) => setInputLocation({ ...inputLocation, city: e.target.value })}
                            placeholder="e.g., London"
                            autoComplete="off"
                            className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                        />
                        {isSuggestionsLoading && <div className="absolute right-3 top-9"><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div></div>}
                        {citySuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {citySuggestions.map((s) => (
                                    <li key={s.place_id} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {s.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="country-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                        <input
                            id="country-input"
                            type="text"
                            value={inputLocation.country}
                            onChange={(e) => setInputLocation({ ...inputLocation, country: e.target.value })}
                            placeholder="e.g., United Kingdom"
                            className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-1 w-full">
                        <label htmlFor="lat-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                        <input
                            id="lat-input"
                            type="number"
                            step="any"
                            value={coordinates.lat}
                            onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                            placeholder="-90 to 90"
                            className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="lon-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                        <input
                            id="lon-input"
                            type="number"
                            step="any"
                            value={coordinates.lon}
                            onChange={(e) => setCoordinates({ ...coordinates, lon: e.target.value })}
                            placeholder="-180 to 180"
                            className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
                        />
                    </div>
                </>
            )}
            <button type="submit" className={`w-full sm:w-auto px-6 py-2 bg-${themeColor}-600 text-white rounded-md hover:bg-${themeColor}-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-500`}>
              Get Times
            </button>
        </form>
      </div>


      {loading ? (
        <Spinner text="Fetching Prayer Times..." themeColor={themeColor} />
      ) : error ? (
        <p className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">{error}</p>
      ) : prayerTimes ? (
        <div className="space-y-6 mt-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Prayer Times for {locationDisplay()}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                {prayerTimes.date.gregorian.date} | {prayerTimes.date.hijri.date} {prayerTimes.date.hijri.month.en} {prayerTimes.date.hijri.year}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {prayerOrder.map((prayerName) => {
              const prayerTime = prayerTimes.timings[prayerName as keyof typeof prayerTimes.timings];
              const isHighlighted = highlightedPrayer === prayerName;
              return (
                <div key={prayerName} className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  isHighlighted
                    ? `bg-${themeColor}-600 text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 shadow'
                }`}>
                  <p className={`font-semibold text-lg ${isHighlighted ? 'text-white' : `text-${themeColor}-700 dark:text-${themeColor}-400`}`}>
                    {prayerName}
                  </p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${isHighlighted ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    {formatTime(prayerTime)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
            <p>Calculation method: {prayerTimes.meta.method.name}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdhanTimes;