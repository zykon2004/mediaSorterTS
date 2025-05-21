import { Formatter, SeasonEpisodePatternNotFound } from "./formatter.ts";
import path from "path";
import fs from "fs";
import * as readlineSync from 'readline-sync';

export class MediaChecker {
  constructor(
    private readonly downloadedMediaIndicators: string[],
    private readonly mediaFileSuffixes: string[],
    private readonly formatter: Formatter
  ) {}

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
    const files = fs.readdirSync(directory);
    const containsMediaFiles = files.some((file) => {
      const filePath = path.join(directory, file);
      return fs.statSync(filePath).isFile() && this.isMediaFile(file);
    });

    if (hasDownloadedIndicator && !containsMediaFiles) {
      console.log(`Directory '${path.basename(directory)}' is marked as downloaded but contains no media files. How would you like to proceed?`);
      const choice = readlineSync.question("1. Delete the directory.\n2. Treat files containing the pattern 'S01E02' as media files.\nChoose an option (1 or 2): ");

      if (choice === '1') {
        return false;
      } else if (choice === '2') {
        const containsPatternFiles = files.some((file) => {
          const filePath = path.join(directory, file);
          return fs.statSync(filePath).isFile() && file.includes('S01E02');
        });
        return containsPatternFiles;
      } else {
        console.log("Invalid choice. Proceeding as if no media files were found.");
        return false;
      }
    }

    return hasDownloadedIndicator && containsMediaFiles;
  }

  isTvShowFile(file: string): boolean {
    if (!this.isDownloadedMediaFile(file)) {
      return false;
    }

    try {
      this.formatter.extractSeasonAndEpisodeFromTvShowFilename(path.basename(file));
      return true;
    } catch (error) {
      if (error instanceof SeasonEpisodePatternNotFound) {
        return false;
      }
      throw error;
    }
  }
  public isDirectoryExists(directory:string): boolean {
    try {
     return fs.statSync(directory).isDirectory();
    } catch (e) {
      return false;
    }
  }
}
