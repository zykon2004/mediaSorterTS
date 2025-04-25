import { ParentDirectory } from "./parentDirectory.ts";
import fs from "fs";
import { MediaChecker } from "./mediaChecker.ts";
import path from "path";
import { Formatter } from "./formatter.ts";

export class Sorter {
  mediaFiles: Set<string> = new Set<string>();
  mediaDirectories: Set<string> = new Set<string>();
  assignedFiles: Set<string> = new Set<string>();
  assignedDirectories: Set<string> = new Set<string>();
  public movedTvShowMediaCount: number = 0;
  public movedMovieMediaCount: number = 0;

  constructor(
    readonly downloadsDirectory: string,
    readonly moviesDirectory: string,
    readonly mediaChecker: MediaChecker,
    readonly formatter: Formatter,
    readonly tvShowParentDirectories: ParentDirectory[],
  ) {}

  public sort(): void {
    this.scanDownloads();
    this.assignAllMediaToParents();
    if (this.assignedDirectories.union(this.assignedFiles).size === 0) {
      console.log("Nothing to assign");
    }
    this.moveAllMediaToAssignedParents();
    this.moveUnassignedMediaToMovies();
    this.cleanupEmptyDirectories();
  }
  public scanDownloads() {
    fs.readdirSync(this.downloadsDirectory).forEach((fileOrDirectory) => {
      const fileOrDirectoryFullPath = path.join(this.downloadsDirectory, fileOrDirectory);
      if (this.mediaChecker.isDownloadedMediaFile(fileOrDirectoryFullPath))
        this.mediaFiles.add(fileOrDirectoryFullPath);
      else if (this.mediaChecker.isDownloadedMediaDirectory(fileOrDirectoryFullPath))
        this.mediaDirectories.add(fileOrDirectoryFullPath);
    });
  }

  public assignAllMediaToParents(): void {
    this.tvShowParentDirectories.forEach((parentDirectory) => {
      this.assignFilesToParents(parentDirectory);
      this.assignDirectoriesToParents(parentDirectory);
    });
  }
  private assignFilesToParents(parentDirectory: ParentDirectory) {
    this.mediaFiles.forEach((file) => {
      const formattedFileName = this.formatter.formatTvShowTitleAndFileName(
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
        this.formatter.formatTvShowTitleAndFileName(path.basename(directory));
      if (formattedDirectoryName.startsWith(parentDirectory.comparableName)) {
        this.assignFilesInsideDirectoryToParent(directory, parentDirectory);
        this.assignedDirectories.add(directory);
      }
    });
  }

  private assignFilesInsideDirectoryToParent(
    directory: string,
    parentDirectory: ParentDirectory,
  ) {
    fs.readdirSync(directory).forEach((file) => {
      if (this.mediaChecker.isDownloadedMediaFile(path.basename(file))) {
        parentDirectory.assignFile(path.join(directory,file));
      }
    });
  }

  private moveAllMediaToAssignedParents(): void {
    this.tvShowParentDirectories.forEach((parentDirectory) => {
      parentDirectory.newlyAssignedFiles.forEach((file) => {
        const dst = parentDirectory.resolveNewFilePath(file);
        this.move(file, dst);
        this.movedTvShowMediaCount++;
      });
    });
    console.log(
      `Moved ${this.movedTvShowMediaCount} files to TV show directories`,
    );
  }

  private move(src: string, dst: string) {
    fs.renameSync(src, dst);
    console.log(`Moved: ${src}\nTo: ${dst}`);
  }

  private moveUnassignedMediaToMovies() {
    this.unassignedMediaFiles
      .union(this.unassignedMediaDirectories)
      .forEach((fileOrFolder) => {
        this.moveToMovies(fileOrFolder);
      });
    console.log(`Moved ${this.movedMovieMediaCount} to movies directories`);
  }

  public isAllDownloadedMediaAssigned(): boolean {
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

  public get unassignedMediaFiles(): Set<string> {
    return new Set(this.mediaFiles).difference(new Set(this.assignedFiles));
  }

  private moveToMovies(src: string): void {
    const dst = path.join(this.moviesDirectory, path.basename(src));
    this.move(src, dst);
    this.movedMovieMediaCount++;
  }

  private cleanupEmptyDirectories() {
    this.assignedDirectories.forEach((directory) => {
      fs.rmSync(directory, {recursive: true});
      console.log(`Deleted ${directory}`);
    });
  }
}
