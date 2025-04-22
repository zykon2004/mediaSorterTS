import type { AppConfig } from "../AppConfig.ts";
import { Formatter } from "../formatter.ts";
import { MediaChecker } from "../mediaChecker.ts";

const tvShowDir = "TVShows";
export const config: AppConfig = {
  tvShowDir: tvShowDir,
  moviesDir: "Movies",
  downloadsDir: "Downloads",
  downloadedMediaIndicators: ["1080p", "720p", "2160p"],
  mediaFileSuffixes: [".mkv", ".avi", ".mov", "mp4"],
  defaultTitleSeparator: " ",
  unifiedSeparator: ".",
  forbiddenCharacters: [";", ":"],
  torrentClientURL: "",
  torrentClientUsername: "",
  torrentClientPassword: "",
  tvShows: ["The Mandalorian tt8111088", "Game of Thrones 2011"],
  forbiddenPrefixes: ["www.UIndex.org    -    ", "www.Torrenting.com - "],
};
export const formatter = new Formatter(
  config.forbiddenPrefixes,
  config.forbiddenCharacters,
  config.defaultTitleSeparator,
  config.unifiedSeparator,
);
export const mediaChecker = new MediaChecker(
  config.downloadedMediaIndicators,
  config.mediaFileSuffixes,
  formatter,
);
export const downloadedMediaIndicator = config
  .downloadedMediaIndicators[0] as string;
export const mediaFileSuffix = config.mediaFileSuffixes[0] as string;

test("load fixtures", () => expect(true).toBe(true));
