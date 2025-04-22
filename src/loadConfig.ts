import path from "path";
import type { AppConfig } from "./AppConfig.ts";
import { createClient } from "redis";

export async function loadAppConfigFromRedis(): Promise<AppConfig> {
  console.log("Starting asynchronous configuration loading from Redis...");

  const client = createClient({ url: process.env.REDIS_URL });
  try {
    await client.connect();
    console.log("Redis client connected.");

    const rawConfig = await client.hGetAll("media_sorter_config");
    const rawTvShows = await client.lRange(
      "media_sorter_config:tv_shows",
      0,
      -1,
    );
    const rawForbiddenPrefixes = await client.lRange(
      "media_sorter_config:forbidden_prefixes",
      0,
      -1,
    );

    const loadedData: AppConfig = {
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
      tvShows: rawTvShows,
      forbiddenPrefixes: rawForbiddenPrefixes || [],
    };

    console.log("Async config loading complete.");
    return loadedData;
  } catch (error) {
    console.error("Error loading configuration from Redis:", error);
    throw error; // Re-throw the error for the caller to handle
  } finally {
    // Ensure the client disconnects even if an error occurs
    if (client.isOpen) {
      await client.disconnect();
      console.log("Redis client disconnected.");
    }
  }
}
