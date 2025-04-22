import { Sorter } from "../sorter.ts";
import {
  config,
  downloadedMediaIndicator,
  formatter,
  mediaChecker,
  mediaFileSuffix,
} from "./fixtures.ts";
import fs from "fs";
import path from "path";
import os from "node:os";
import { createParentTvShowDirectories } from "../parentDirectory.ts";
import { TVShow } from "../AppConfig.ts";
import logger from "../logger.ts";

describe("Sorter", () => {
  let tempTestDir: string;
  let mandalorianDirectoryPath: string;
  let appDirectoryPath: string;
  let personalMediaDirectoryPath: string;
  let aMovieDirectoryPath: string;
  let downloadedMediaFilePath: string;
  let loggerInfoSpy: jest.SpyInstance;
  let sorter: Sorter;
  beforeEach(() => {
    const tempDirPrefix = path.join(os.tmpdir(), "mediaFile-test-");
    tempTestDir = fs.mkdtempSync(tempDirPrefix);
    const downloadsDirectoryPath = path.join(tempTestDir, config.downloadsDir);
    fs.mkdirSync(downloadsDirectoryPath, { recursive: true });

    const movieDirectoryPath = path.join(
      downloadsDirectoryPath,
      config.moviesDir,
    );
    fs.mkdirSync(movieDirectoryPath, { recursive: true });

    const tvShowsDirectoryPath = path.join(
      downloadsDirectoryPath,
      config.tvShowDir,
    );
    fs.mkdirSync(tvShowsDirectoryPath, { recursive: true });

    // Counts as a TV show directory
    const downloadedMediaDirectory = `The.Mandalorian.S02E02.Chapter.10.${downloadedMediaIndicator}.WEB-DL.DDP.5.1.Atmos.H.264-PHOENIX`;
    mandalorianDirectoryPath = path.join(
      downloadsDirectoryPath,
      downloadedMediaDirectory,
    );
    fs.mkdirSync(mandalorianDirectoryPath, { recursive: true });
    fs.writeFileSync(
      path.join(
        mandalorianDirectoryPath,
        `${downloadedMediaDirectory}${mediaFileSuffix}`,
      ),
      "",
    );
    fs.writeFileSync(path.join(mandalorianDirectoryPath, "readme.txt"), "");

    // Does not count as a media directory
    const downloadedAppDirectory = "Photoshop CS2";
    appDirectoryPath = path.join(
      downloadsDirectoryPath,
      downloadedAppDirectory,
    );
    fs.mkdirSync(appDirectoryPath, { recursive: true });
    fs.writeFileSync(path.join(appDirectoryPath, "setup.exe"), "");

    // Does not count as a media directory
    const personalMediaDirectory = "Wedding Videos";
    personalMediaDirectoryPath = path.join(
      downloadsDirectoryPath,
      personalMediaDirectory,
    );
    fs.mkdirSync(personalMediaDirectoryPath, { recursive: true });
    fs.writeFileSync(
      path.join(personalMediaDirectoryPath, `ceremony${mediaFileSuffix}`),
      "",
    );

    // Counts as a movie directory
    const aMovieDirectory =
      "Nosferatu (2024) (1080p MA WEB-DL x265 10bit EAC3 Atmos 5.1 Ghost) [QxR]";
    aMovieDirectoryPath = path.join(downloadsDirectoryPath, aMovieDirectory);
    fs.mkdirSync(aMovieDirectoryPath, { recursive: true });
    fs.writeFileSync(
      path.join(aMovieDirectoryPath, `${aMovieDirectory}${mediaFileSuffix}`),
      "",
    );
    fs.writeFileSync(path.join(aMovieDirectoryPath, "readme.txt"), "");

    // Counts as a movie file
    const downloadedMediaFile = `S.W.A.T.2017.S07E10.${downloadedMediaIndicator}.HDTV.x265-MiNX[TGx]${mediaFileSuffix}`;
    downloadedMediaFilePath = path.join(
      downloadsDirectoryPath,
      downloadedMediaFile,
    );
    fs.writeFileSync(downloadedMediaFilePath, "");

    const parentDirectories = createParentTvShowDirectories(
      config.tvShows.map((title) => {
        return {
          title: title,
          path: path.join(tvShowsDirectoryPath, title),
        } as TVShow;
      }),
      formatter,
    );
    sorter = new Sorter(
      downloadsDirectoryPath,
      movieDirectoryPath,
      mediaChecker,
      formatter,
      parentDirectories,
    );
  });
  afterEach(() => {
    if (tempTestDir) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });
  test("scanDownloads", () => {
    sorter.scanDownloads();
    expect(sorter.mediaDirectories).toContain(mandalorianDirectoryPath);
    expect(sorter.mediaFiles).toContain(downloadedMediaFilePath);
    expect(sorter.mediaDirectories).toContain(aMovieDirectoryPath);
    expect(sorter.mediaDirectories).not.toContain(personalMediaDirectoryPath);
  });
  test("AssignAllMediaToParents", () => {
    let sumNewlyAssignedFiles = 0;
    sorter.scanDownloads();
    sorter.assignAllMediaToParents();
    sorter.tvShowParentDirectories.forEach((parentDirectory) => {
      sumNewlyAssignedFiles += parentDirectory.newlyAssignedFiles.size;
    });
    expect(sumNewlyAssignedFiles).toBeGreaterThan(0);
    expect(sorter.isAllDownloadedMediaAssigned()).toBe(false);
    expect(sorter.unassignedMediaFiles.size).toBe(1);
  });
  test("sort", () => {
    loggerInfoSpy = jest.spyOn(logger, "info").mockImplementation(() => {});
    sorter.sort();
    expect(sorter.movedTvShowMediaCount).toBe(1);
    expect(sorter.movedMovieMediaCount).toBe(2);
    const allLogMessages = loggerInfoSpy.mock.calls
      .map((call) => call[0]?.toString() ?? "") // Safely convert first arg to string
      .join("\n");

    // Check if the aggregated logs contain the expected substrings
    expect(allLogMessages).toContain("Moved");
    expect(allLogMessages).toContain("Deleted");
  });
});
