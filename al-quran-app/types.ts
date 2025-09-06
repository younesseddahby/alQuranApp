
export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface AyahText {
  number: number;
  text: string;
  numberInSurah: number;
}

export interface AyahAudio {
  number: number;
  audio: string;
  numberInSurah: number;
  text: string;
  englishText: string;
}

export interface FullSurahText {
  number: number;
  name: string;
  englishName: string;
  ayahs: AyahText[];
}

export interface FullSurahAudio {
    number: number;
    name: string;
    englishName: string;
    ayahs: AyahAudio[];
}

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export interface HijriInfo {
    date: string;
    day: string;
    month: {
        number: number;
        en: string;
        ar: string;
    };
    year: string;
}

export interface GregorianInfo {
    date: string;
    day: string;
    month: {
        number: number;
        en: string;
    };
    year: string;
}

export interface DateInfo {
    readable: string;
    timestamp: string;
    hijri: HijriInfo;
    gregorian: GregorianInfo;
}

export interface MetaInfo {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
        id: number;
        name: string;
    };
}

export interface PrayerTimeData {
    timings: PrayerTimes;
    date: DateInfo;
    meta: MetaInfo;
}

// FIX: Add missing Hadith types for HadithViewer component.
export interface HadithItem {
  urn: number;
  book: {
    name: string;
    id: string;
  };
  hadithNumber: string;
  english: {
    text: string;
  };
}

export interface HadithApiResponse {
  hadiths: HadithItem[];
  last_page: number;
}
