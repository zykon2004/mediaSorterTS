export interface TVShow {
  title: string;
  path: string;
}

export interface AppConfig {
  tvShowDir: string;
  moviesDir: string;
  downloadsDir: string;
  downloadedMediaIndicators: string[];
  mediaFileSuffixes: string[];
  defaultTitleSeparator: string;
  unifiedSeparator: string;
  forbiddenCharacters: string[];
  torrentClientURL: string;
  torrentClientUsername: string;
  torrentClientPassword: string;
  tvShows: string[];
  forbiddenPrefixes: string[];
}
