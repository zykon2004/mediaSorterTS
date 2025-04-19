import type { AppConfig } from "../AppConfig.ts";
import { Formatter } from "../formatter.ts";
import { MediaFile } from "../mediaFile.ts";

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
export const formatter = new Formatter(config);
export const mediaFile = new MediaFile(config);
export const downloadedMediaIndicator = config.downloadedMediaIndicators[0];
export const mediaFileSuffix = config.mediaFileSuffixes[0];
test("load fixtures", () => expect(true).toBe(true));
