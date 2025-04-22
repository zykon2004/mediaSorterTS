import { Sorter } from "../sorter.ts";
import {
  config, downloadedMediaIndicator,
  formatter,
  mediaChecker, mediaFileSuffix,
  parentDirectories,
} from "./fixtures.ts";
import fs from "fs";
import path from "path";
import os from "node:os";

describe("Sorter", () => {
  let tempTestDir: string;
  let mandalorianDirectoryPath: string;
  let appDirectoryPath: string;
  let personalMediaDirectoryPath: string;
  let aMovieDirectoryPath: string;
  let downloadedMediaFilePath: string;
  let consoleLogSpy: jest.SpyInstance;
  let sorter: Sorter;
  beforeEach(() => {
    const tempDirPrefix = path.join(os.tmpdir(), "mediaFile-test-");
    tempTestDir = fs.mkdtempSync(tempDirPrefix);
    // Counts as a TV show directory
    const downloadedMediaDirectory = `The.Mandalorian.S02E02.Chapter.10.${downloadedMediaIndicator}.WEB-DL.DDP.5.1.Atmos.H.264-PHOENIX`;
    mandalorianDirectoryPath = path.join(
        tempTestDir,
        config.downloadsDir,
        downloadedMediaDirectory,
    );
    fs.mkdirSync(mandalorianDirectoryPath, { recursive: true });
    fs.writeFileSync(
        path.join(
            mandalorianDirectoryPath,
            `The.Mandalorian.S01E01.episode${mediaFileSuffix}`,
        ),
        "",
    );
    fs.writeFileSync(path.join(mandalorianDirectoryPath, "readme.txt"), "");

    // Does not count as a media directory
    const downloadedAppDirectory = "Photoshop CS2";
    appDirectoryPath = path.join(
        tempTestDir,
        config.downloadsDir,
        downloadedAppDirectory,
    );
    fs.mkdirSync(appDirectoryPath, { recursive: true });
    fs.writeFileSync(path.join(appDirectoryPath, "setup.exe"), "");

    // Does not count as a media directory
    const personalMediaDirectory = "Wedding Videos";
    personalMediaDirectoryPath = path.join(
        tempTestDir,
        config.downloadsDir,
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
    aMovieDirectoryPath = path.join(
        tempTestDir,
        config.downloadsDir,
        aMovieDirectory,
    );
    fs.mkdirSync(aMovieDirectoryPath, { recursive: true });
    fs.writeFileSync(
        path.join(aMovieDirectoryPath, `${aMovieDirectory}${mediaFileSuffix}`),
        "",
    );
    fs.writeFileSync(path.join(aMovieDirectoryPath, "readme.txt"), "");

    // Counts as a movie file
    const downloadedMediaFile = `S.W.A.T.2017.S07E10.${downloadedMediaIndicator}.HDTV.x265-MiNX[TGx]${mediaFileSuffix}`;
    downloadedMediaFilePath = path.join(
        tempTestDir,
        config.downloadsDir,
        downloadedMediaFile,
    );
    fs.writeFileSync(downloadedMediaFilePath, "");
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    sorter = new Sorter(
      tempTestDir,
      config.moviesDir,
      mediaChecker,
      formatter,
      parentDirectories,
    );
  });
  afterEach(() => {
    consoleLogSpy.mockRestore();
    if (tempTestDir) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });
  test("scanDownloads", () => {
    sorter.scanDownloads();
    expect(sorter.assignedFiles).toEqual(1);
  });
});
