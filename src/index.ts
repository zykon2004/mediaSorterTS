import { loadAppConfigFromRedis } from "./loadConfig.ts";
import { Formatter } from "./formatter.ts";
import { QBittorrentClient } from "./qbittorentClient.ts";
import logger from "./logger.ts";
import { MediaChecker } from "./mediaChecker.ts";
import { Sorter } from "./sorter.ts";
import { createParentTvShowDirectories } from "./parentDirectory.ts";
import path from "path";
import { TVShow } from "./AppConfig.ts";
import * as process from "node:process";

logger.info("@@@ STARTED: MediaSorterTS @@@");
const config = await loadAppConfigFromRedis();
const qBittorrentClient = new QBittorrentClient(config.torrentClientURL);
if (!qBittorrentClient.isAllTorrentsCompleted()) {
  logger.error("Torrent client is still downloading. Exiting...");
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
logger.info("@@@@ ENDED: MediaSorterTS @@@@");
process.exit(0);
