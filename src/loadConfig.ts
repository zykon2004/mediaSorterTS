import type { AppConfig } from "./AppConfig.ts";
import { createClient } from "redis";
import logger from "./logger.ts";

const AUTH_NOT_CONFIGURED_PATTERN =
  /ERR AUTH .*without any password configured for the default user/i;

export function stripRedisCredentials(redisUrl: string): string {
  const parsedUrl = new URL(redisUrl);
  parsedUrl.username = "";
  parsedUrl.password = "";
  return parsedUrl.toString();
}

function shouldRetryWithoutAuth(error: unknown): boolean {
  return AUTH_NOT_CONFIGURED_PATTERN.test(String(error));
}

async function connectRedisClient(redisUrl: string) {
  let client = createClient({ url: redisUrl });
  try {
    await client.connect();
    await client.ping();
    return client;
  } catch (error) {
    if (client.isOpen) {
      await client.disconnect();
    }
    if (!shouldRetryWithoutAuth(error)) {
      throw error;
    }

    logger.warn(
      "Redis rejected AUTH for the default user; retrying without credentials from REDIS_URL_R4K_DB",
    );

    client = createClient({ url: stripRedisCredentials(redisUrl) });
    await client.connect();
    return client;
  }
}

export async function loadAppConfigFromRedis(): Promise<AppConfig> {
  const redisUrl = process.env.REDIS_URL_R4K_DB;
  if (!redisUrl) {
    throw new Error("REDIS_URL_R4K_DB is not set");
  }

  const client = await connectRedisClient(redisUrl);
  try {
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
      tvShows: rawTvShows,
      forbiddenPrefixes: rawForbiddenPrefixes || [],
    };

    logger.info("Loaded config from Redis");
    return loadedData;
  } catch (error) {
    throw error;
  } finally {
    // Ensure the client disconnects even if an error occurs
    if (client.isOpen) {
      await client.disconnect();
    }
  }
}
