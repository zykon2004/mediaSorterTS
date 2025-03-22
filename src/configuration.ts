import { createClient, type RedisClientType } from "redis";
import * as path from "node:path";
import { log } from "node:console";

interface TVShow {
  title: string,
  path: string,
}
interface Configuration {
  tvShowDir: string,
  moviesDir: string,
  downloadsDir: string,
  downloadedMediaIndicators: string[],
  mediaFileSuffixes: string[],
  defaultTitleSeparator: string,
  unifiedSeparator: string,
  forbidden_characters: string[],
  torrentClientURL: string,
  torrentClientUsername: string,
  torrentClientPassword: string,
}


const client: RedisClientType = createClient({
  url: "redis://192.168.1.99:6379/1",
});
async function connectAndGet() {
  try {
    await client.connect();
    const rawConfig = await client.hGetAll("media_sorter_config");
    const config: Configuration = {
      tvShowDir: rawConfig.tv_shows_dir || "",
      moviesDir: rawConfig.movies_dir || "",
      downloadsDir: rawConfig.downloads_dir || "",
      downloadedMediaIndicators: rawConfig.downloaded_media_indicators?.split(" ") || [],
      mediaFileSuffixes: rawConfig.media_files_suffixes?.split(" ") || [],
      defaultTitleSeparator: rawConfig.default_title_separator || "",
      unifiedSeparator: rawConfig.unified_separator || "",
      forbidden_characters: rawConfig.forbidden_characters?.split(" ") || [],
      torrentClientURL: rawConfig.torrent_url || "",
      torrentClientUsername: rawConfig.torrent_username || "",
      torrentClientPassword: rawConfig.torrent_password || "",
    }
    console.log(config);

    const rawTvShows = await client.lRange("media_sorter_config:tv_shows", 0, -1);
    const tvShows: TVShow[] = rawTvShows.map((title) => ({ title: title, path: path.join(config.tvShowDir, title) }));
    console.log(tvShows);
    //for (const show of rawTvShows) {
    //  console.log(path.parse(path.join(config.tvShowDir!, show)))
    //}
    // console.log("Stored config:", storedConfig.tv_shows_dir, tvShows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.quit();
  }
}

// Execute the function
connectAndGet();
