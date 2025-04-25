import { loadAppConfigFromRedis } from "./loadConfig.ts";
import { Formatter } from "./formatter.ts";
import { QBittorrentClient } from "./qbittorentClient.ts";
import { MediaChecker } from "./mediaChecker.ts";
import { Sorter } from "./sorter.ts";
import { createParentTvShowDirectories } from "./parentDirectory.ts";
import path from "path";
import type { TVShow } from "./AppConfig.ts";
import logger from "./logger.ts";

async function main() {
  const config = await loadAppConfigFromRedis();
  const qBittorrentClient = new QBittorrentClient(config.torrentClientURL);
  if (!(await qBittorrentClient.isAllTorrentsCompleted())) {
    logger.error("Torrent client is still downloading. Exiting...");
    return;
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
  if (
    [config.downloadsDir, config.tvShowDir, config.moviesDir].some(
      (directory) => {
        const isExists = mediaChecker.isDirectoryExists(directory);
        if (!isExists) {
          logger.error(`Required directory: ${directory} does not exist`);
        }
        return !isExists;
      },
    )
  ) {
    return;
  }
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
  await qBittorrentClient.deleteAllCompletedTorrentsFromList();
  sorter.sort();
}



logger.info("@@@ STARTED: MediaSorterTS @@@");
try {
  await main();
} catch (e) {
  logger.error(e);
}
logger.info("@@@@ ENDED: MediaSorterTS @@@@");
