import { ParentDirectory } from "./parentDirectory.ts";
import fs from "fs";
import { MediaChecker } from "./mediaChecker.ts";
import logger from "./logger.ts";
import path from "path";
import { Formatter } from "./formatter.ts";

export class Sorter {
  mediaFiles: Set<string> = new Set<string>();
  mediaDirectories: Set<string> = new Set<string>();
  assignedFiles: Set<string> = new Set<string>();
  assignedDirectories: Set<string> = new Set<string>();
  movedSeriesMediaCount: number = 0;
  movedMovieMediaCount: number = 0;

  constructor(
    readonly DownloadsDirectory: string,
    readonly moviesDirectory: string,
    readonly mediaChecker: MediaChecker,
    readonly formatter: Formatter,
    readonly seriesParentDirectories: ParentDirectory[],
  ) {
    fs.readdirSync(this.DownloadsDirectory).forEach((fileOrDirectory) => {
      if (this.mediaChecker.isDownloadedMediaFile(fileOrDirectory))
        this.mediaFiles.add(fileOrDirectory);
      else if (this.mediaChecker.isDownloadedMediaDirectory(fileOrDirectory))
        this.mediaDirectories.add(fileOrDirectory);
    });
  }
  public sort(): void {
    this.assignAllMediaToParents();
    if (this.assignedDirectories.union(this.assignedFiles).size === 0) {
      logger.info("Nothing to assign");
    }
    this.moveAllMediaToAssignedParents();
    this.moveUnassignedMediaToMovies();
    this.cleanupEmptyDirectories();
  }
  private assignAllMediaToParents(): void {
    this.seriesParentDirectories.forEach((parentDirectory) => {
      this.assignFilesToParents(parentDirectory);
      this.assignDirectoriesToParents(parentDirectory);
    });
  }
  private assignFilesToParents(parentDirectory: ParentDirectory) {
    this.mediaFiles.forEach((file) => {
      const formattedFileName = this.formatter.formatSeriesTitleAndFileName(
        path.basename(file),
      );
      if (formattedFileName.startsWith(parentDirectory.comparableName)) {
        parentDirectory.assignFile(file);
        this.assignedFiles.add(file);
      }
    });
  }

  /**
   * Assigns media directories and their valid media files to the specified parent directory
   * if the directory name matches the parent's comparable name.
   * @param parentDirectory The parent directory to assign matching media directories and files to.
   */
  private assignDirectoriesToParents(parentDirectory: ParentDirectory): void {
    this.mediaDirectories.forEach((directory) => {
      const formattedDirectoryName =
        this.formatter.formatSeriesTitleAndFileName(path.basename(directory));
      if (formattedDirectoryName.startsWith(parentDirectory.comparableName)) {
        this.filesInsideDirectoryToParent(directory, parentDirectory);
        this.assignedDirectories.add(directory);
      }
    });
  }

  private filesInsideDirectoryToParent(
    directory: string,
    parentDirectory: ParentDirectory,
  ) {
    fs.readdirSync(directory).forEach((file) => {
      if (this.mediaChecker.isDownloadedMediaFile(path.basename(file))) {
        parentDirectory.assignFile(file);
      }
    });
  }

  private moveAllMediaToAssignedParents(): void {
    this.seriesParentDirectories.forEach((parentDirectory) => {
      parentDirectory.newlyAssignedFiles.forEach((file) => {
        const dst = parentDirectory.resolveNewFilePath(file);
        this.move(file, dst);
        this.movedSeriesMediaCount++;
      });
    });
    logger.info(
      `Moved ${this.movedSeriesMediaCount} files to series directories`,
    );
  }

  private move(src: string, dst: string) {
    fs.renameSync(src, dst);
    logger.info(`Moved: ${src}\nTo: ${dst}`);
  }

  private moveUnassignedMediaToMovies() {
    this.unassignedMediaFiles
      .union(this.unassignedMediaDirectories)
      .forEach((fileOrFolder) => {
        this.moveToMovies(fileOrFolder);
      });
    logger.info(`Moved ${this.movedMovieMediaCount} to movies directories`);
  }

  private isAllDownloadedMediaAssigned(): boolean {
    return (
      this.unassignedMediaFiles.size === 0 &&
      this.unassignedMediaDirectories.size === 0
    );
  }

  private get unassignedMediaDirectories(): Set<string> {
    return new Set(this.mediaDirectories).difference(
      new Set(this.assignedDirectories),
    );
  }

  private get unassignedMediaFiles(): Set<string> {
    return new Set(this.mediaFiles).difference(new Set(this.assignedFiles));
  }

  private moveToMovies(src: string): void {
    const dst = path.join(this.moviesDirectory, path.basename(src));
    this.move(src, dst);
    this.movedMovieMediaCount++;
  }

  private cleanupEmptyDirectories() {
    this.assignedDirectories.forEach((directory) => {
      fs.rmdirSync(directory);
      logger.info(`Deleted ${directory}`);
    });
  }
}
