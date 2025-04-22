import path from "path";
import fs from "fs";
import {
  config,
  downloadedMediaIndicator,
  mediaChecker,
  mediaFileSuffix,
} from "./fixtures.ts";
import * as os from "node:os";

describe("isDownloadedMediaFile", () => {
  test.each<[string, string, boolean]>([
    [
      `A file ending with .mkv and contains ${downloadedMediaIndicator}`,
      `The.Mandalorian.S02E02.Chapter.10.${downloadedMediaIndicator}.WEB-DL.DDP.5.1.Atmos.H.264-PHOENIX${mediaFileSuffix}`,
      true,
    ],
    [
      "Contains downloaded media pattern but is not a file",
      `The.Mandalorian.S02E02.Chapter.10.${downloadedMediaIndicator}.ASP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENIX`,
      false,
    ],
    [
      "A file ending with .mkv but does not contain a downloaded media pattern",
      `Our Wedding 2019${mediaFileSuffix}`,
      false,
    ],
  ])("%s", (_testId: string, filename: string, expectedResult: boolean) => {
    expect(mediaChecker.isDownloadedMediaFile(filename)).toBe(expectedResult);
  });
});

describe("isDownloadedMediaDirectory", () => {
  let tempTestDir: string;
  let mandalorianDirectoryPath: string;
  let appDirectoryPath: string;
  let personalMediaDirectoryPath: string;
  let aMovieDirectoryPath: string;
  let downloadedMediaFilePath: string;

  beforeAll(() => {
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
  });

  afterAll(() => {
    // Clean up the temporary directory after each test
    if (tempTestDir) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });
  test("finds downloaded file in directory", () => {
    expect(mediaChecker.isDownloadedMediaDirectory(mandalorianDirectoryPath)).toBe(
      true,
    );
  });
  test("downloaded app directory is not recognized as downloaded media directory", () => {
    expect(mediaChecker.isDownloadedMediaDirectory(appDirectoryPath)).toBe(false);
  });

  test("personal media folder is not recognized as downloaded media", () => {
    expect(
      mediaChecker.isDownloadedMediaDirectory(personalMediaDirectoryPath),
    ).toBe(false);
  });
});

describe("isTvShowFile", () => {
  test.each<[string, string, boolean]>([
    [
      "A file downloaded file containing s02e02 pattern",
      `The.Mandalorian.S02E02.Chapter.10.${downloadedMediaIndicator}.WEB-DL.DDP.5.1.Atmos.H.264-PHOENIX${mediaFileSuffix}`,
      true,
    ],
    [
      "Downloaded media, but not a TV show",
      `The.Ministry.of.Ungentlemanly.Warfare.2024.${downloadedMediaIndicator}.AMAZON.WEBRip.1400MB-GalaxyRG${mediaFileSuffix}`,
      false,
    ],
    ["Not a media file", "1.jpeg", false],
    ["Not a downloaded file", `Our Wedding 2019${mediaFileSuffix}`, false],
  ])("%s", (_testId: string, filename: string, expectedResult: boolean) => {
    // Configure the test with proper media indicators and suffixes
    expect(mediaChecker.isTvShowFile(filename)).toBe(expectedResult);
  });
});
