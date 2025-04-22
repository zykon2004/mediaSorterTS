import { Formatter } from "./formatter.ts";
import path from "path";
import { TVShow } from "./AppConfig.ts";

export class ParentDirectory {
  public newlyAssignedFiles: Set<string> = new Set();
  readonly comparableName: string;

  constructor(
    readonly directoryPath: string,
    readonly formatter: Formatter,
  ) {
    this.comparableName = this.formatter.formatTvShowTitleAndFileName(
      path.basename(this.directoryPath),
    );
  }
  resolveNewFilePath(assignedFile: string): string {
    return path.join(
      this.directoryPath,
      this.formatter.formatTvShowFilenameBeforeRename(
        path.basename(assignedFile),
        path.basename(this.directoryPath),
      ),
    );
  }
  assignFile(filePath:string): void {
    this.newlyAssignedFiles.add(filePath);
  }
}

export function createParentTvShowDirectories(
  tvShowRootDirectory: string,
  tvShows: TVShow[],
  formatter: Formatter,
): ParentDirectory[] {
  const directories: ParentDirectory[] = [];
  for (const tvShow of tvShows) {
    directories.push(new ParentDirectory(tvShow.path, formatter));
  }
  return directories;
}
