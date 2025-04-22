import { Sorter } from "../sorter.ts";
import type { AppConfig } from "../AppConfig.ts";
import { Formatter } from "../formatter.ts";
import { MediaChecker } from "../mediaChecker.ts";
import path from "path";
import { createParentTvShowDirectories } from "../parentDirectory.ts";
const rawTVShows = ["The Mandalorian tt8111088", "Game of Thrones 2011"];
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
  tvShows: rawTVShows.map((title) => ({
    title: title,
    path: path.join(tvShowDir || "", title),
  })),
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
const parentDirectories = createParentTvShowDirectories(
  config.tvShowDir,
  config.tvShows,
  formatter,
);
export const sorter = new Sorter(
  config.downloadsDir,
  config.moviesDir,
  mediaChecker,
  formatter,
  parentDirectories,
);
test("load fixtures", () => expect(true).toBe(true));
