import { loadAppConfigFromRedis } from "./loadConfig.ts";
import { Formatter } from "./formatter.ts";
import { QBittorrentClient } from "./qbittorentClient.ts";
import { MediaChecker } from "./mediaChecker.ts";
import { Sorter } from "./sorter.ts";
import { createParentTvShowDirectories } from "./parentDirectory.ts";
import path from "path";
import type {TVShow} from "./AppConfig.ts";
import * as process from "node:process";
import fs from "fs";

console.log("@@@ STARTED: MediaSorterTS @@@");
try {
  const config = await loadAppConfigFromRedis();
  try{
    fs.statSync(config.downloadsDir)
  } catch (e) {
    console.log(e)
  }
  console.log(config.downloadsDir);
  if (!fs.statSync(config.downloadsDir).isDirectory()) {
    console.error(`Downloads directory ${config.downloadsDir} does not exist`)
  }
  if (!fs.statSync(config.moviesDir).isDirectory()) {
    console.error(`Movies directory ${config.moviesDir} does not exist`)
  }
  if (!fs.statSync(config.tvShowDir).isDirectory()) {
    console.error(`TVShow directory ${config.tvShowDir} does not exist`)
  }
  const qBittorrentClient = new QBittorrentClient(config.torrentClientURL);
  if (!qBittorrentClient.isAllTorrentsCompleted()) {
    console.error("Torrent client is still downloading. Exiting...");
    process.exit(1);
  }

  const formatter = new Formatter(
    config.forbiddenPrefixes,
    config.forbiddenCharacters,
    config.defaultTitleSeparator,
    config.unifiedSeparator,
  );
  const mediaChecker = new MediaChecker(
    config.downloadedMediaIndicators,
    config.mediaFileSuffixes,
    formatter,
  );
  const tvShowParentDirectories = createParentTvShowDirectories(
    config.tvShows.map((title) => {
      return {
        title: title,
        path: path.join(config.tvShowDir, title),
      } as TVShow;
    }),
    formatter,
  );
  const sorter = new Sorter(
    config.downloadsDir,
    config.moviesDir,
    mediaChecker,
    formatter,
    tvShowParentDirectories,
  );
  await qBittorrentClient.deleteAllTorrentsFromList();
  sorter.sort();
} finally {
  console.log("@@@@ ENDED: MediaSorterTS @@@@");
  process.exit(0);
}
