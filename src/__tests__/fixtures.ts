import type { AppConfig } from "../AppConfig.ts";
import { Formatter } from "../formatter.ts";
import { MediaChecker } from "../mediaChecker.ts";

export const config: AppConfig = {
  tvShowDir: "TVShows",
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
  tvShows: [],
  forbiddenPrefixes: ["www.UIndex.org    -    ", "www.Torrenting.com - "],
};
export const formatter = new Formatter(
  config.forbiddenPrefixes,
  config.forbiddenCharacters,
  config.defaultTitleSeparator,
  config.unifiedSeparator
);
export const mediaFile = new MediaChecker(
  config.downloadedMediaIndicators,
  config.mediaFileSuffixes,
  formatter
);
export const downloadedMediaIndicator = config
  .downloadedMediaIndicators[0] as string;
export const mediaFileSuffix = config.mediaFileSuffixes[0] as string;
test("load fixtures", () => expect(true).toBe(true));
