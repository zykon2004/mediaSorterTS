import {createClient, type RedisClientType} from "redis";
import * as path from "node:path";

interface TVShow {
  title: string;
  path: string;
}
interface Configuration {
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
  tvShows: TVShow[];
  forbiddenPrefixes: string[];
}

async function loadConfig(): Promise<Configuration | undefined> {
  const client: RedisClientType = createClient({
    url: "redis://192.168.1.99:6379/1",
  });
  try {
    await client.connect();
    const rawConfig = await client.hGetAll("media_sorter_config");
    const rawTvShows = await client.lRange(
      "media_sorter_config:tv_shows",
      0,
      -1,
    );
    const forbiddenPrefixes = await client.lRange("media_sorter_config:forbidden_prefixes", 0, -1);
    return {
      tvShowDir: rawConfig.tv_shows_dir || "",
      moviesDir: rawConfig.movies_dir || "",
      downloadsDir: rawConfig.downloads_dir || "",
      downloadedMediaIndicators:
          rawConfig.downloaded_media_indicators?.split(" ") || [],
      mediaFileSuffixes: rawConfig.media_files_suffixes?.split(" ") || [],
      defaultTitleSeparator: rawConfig.default_title_separator || "",
      unifiedSeparator: rawConfig.unified_separator || "",
      forbiddenCharacters: rawConfig.forbidden_characters?.split(" ") || [],
      torrentClientURL: rawConfig.torrent_url || "",
      torrentClientUsername: rawConfig.torrent_username || "",
      torrentClientPassword: rawConfig.torrent_password || "",
      tvShows: rawTvShows.map((title) => ({
        title: title,
        path: path.join(rawConfig.tv_shows_dir || "", title),
      })),
      forbiddenPrefixes: forbiddenPrefixes || [],
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.quit();
  }
}
export const config = await loadConfig() as Configuration;
