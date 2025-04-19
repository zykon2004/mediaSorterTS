import type { AppConfig } from "./AppConfig";
import { Formatter, SeasonEpisodePatternNotFound } from "./formatter";
import path from "path";
import fs from "fs";

export class MediaFile {
  private readonly config: AppConfig;
  private readonly formatter: Formatter;

  constructor(config: AppConfig) {
    this.config = config;
    this.formatter = new Formatter(config);
  }

  isDownloadedMediaFile(file: string): boolean {
    const filename = path.basename(file);
    return this.isMediaFile(filename) && this.isDownloaded(filename);
  }

  private isDownloaded(filename: string): boolean {
    return this.config.downloadedMediaIndicators.some((indicator) =>
      filename.includes(indicator),
    );
  }

  private isMediaFile(filename: string): boolean {
    const suffix = filename.split(".").pop() || "";
    return this.config.mediaFileSuffixes.includes(`.${suffix}`);
  }

  isDownloadedMediaDirectory(directory: string): boolean {
    if (!fs.statSync(directory).isDirectory()) {
      return false;
    }

    const hasDownloadedIndicator = this.isDownloaded(path.basename(directory));
    const containsMediaFiles = fs.readdirSync(directory).some((file) => {
      return fs.statSync(path.join(directory, file)).isFile() && this.isMediaFile(file)
    });

    return hasDownloadedIndicator && containsMediaFiles;
  }

  isSeriesFile(file: string): boolean {
    if (!this.isDownloadedMediaFile(file)) {
      return false;
    }

    try {
      this.formatter.extractSeasonAndEpisodeFromSeriesFilename(path.basename(file));
      return true;
    } catch (error) {
      if (error instanceof SeasonEpisodePatternNotFound) {
        return false;
      }
      throw error;
    }
  }
}
