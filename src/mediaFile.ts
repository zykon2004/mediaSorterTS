import type { AppConfig } from "./AppConfig";
import { Formatter, SeasonEpisodePatternNotFound } from "./formatter";
import path from "path";
import fs from "fs";

export class MediaFile {
  private readonly downloadedMediaIndicators: string[];
  private readonly mediaFileSuffixes: string[];
  private readonly formatter: Formatter;

  constructor(config: AppConfig, formatter: Formatter) {
    this.downloadedMediaIndicators = config.downloadedMediaIndicators;
    this.mediaFileSuffixes = config.mediaFileSuffixes;
    this.formatter = formatter;
  }

  isDownloadedMediaFile(file: string): boolean {
    const filename = path.basename(file);
    return this.isMediaFile(filename) && this.isDownloaded(filename);
  }

  private isDownloaded(filename: string): boolean {
    return this.downloadedMediaIndicators.some((indicator) =>
      filename.includes(indicator),
    );
  }

  private isMediaFile(filename: string): boolean {
    const suffix = filename.split(".").pop() || "";
    return this.mediaFileSuffixes.includes(`.${suffix}`);
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
