import path from "path";
import fs from "fs";
import {
  config,
  downloadedMediaIndicator,
  mediaChecker,
  mediaFileSuffix,
  formatter, // Added formatter
} from "./fixtures.ts";
import * as os from "node:os";
import * as readlineSync from 'readline-sync'; // Added readlineSync
import { MediaChecker } from "../mediaChecker.ts"; // Added MediaChecker

// Mock readline-sync
jest.mock('readline-sync');

describe("isDownloadedMediaFile", () => {
  it.each<[string, string, boolean]>([
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
  it("finds downloaded file in directory", () => {
    expect(mediaChecker.isDownloadedMediaDirectory(mandalorianDirectoryPath)).toBe(
      true,
    );
  });
  it("doesn't recognize downloaded app directory as downloaded media directory", () => {
    expect(mediaChecker.isDownloadedMediaDirectory(appDirectoryPath)).toBe(false);
  });

  it("doesn't recognize personal media folder as downloaded media", () => {
    expect(
      mediaChecker.isDownloadedMediaDirectory(personalMediaDirectoryPath),
    ).toBe(false);
  });
});

// New test suite for user prompt scenario
describe("isDownloadedMediaDirectory - User Prompt Scenario", () => {
  let tempTestDir: string;
  let mediaCheckerInstance: MediaChecker;
  const mockDownloadedMediaIndicator = "[DOWNLOADED]";
  const mockMediaFileSuffixes = [".mkv", ".mp4"];

  beforeEach(() => {
    // Create a temporary directory for testing
    const tempDirPrefix = path.join(os.tmpdir(), "mediaChecker-prompt-test-");
    tempTestDir = fs.mkdtempSync(tempDirPrefix);

    mediaCheckerInstance = new MediaChecker(
      [mockDownloadedMediaIndicator],
      mockMediaFileSuffixes,
      formatter,
    );
  });

  afterEach(() => {
    // Clean up the temporary directory after each test
    if (tempTestDir) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("should return false when user chooses to delete the directory (Option 1)", () => {
    const directoryName = `Test Series S01E01 ${mockDownloadedMediaIndicator}`;
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    (readlineSync.question as jest.Mock).mockReturnValue("1");

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(false);
    expect(readlineSync.question).toHaveBeenCalledTimes(1);
  });

  it("should return true when user chooses Option 2 and 'S01E02' file exists", () => {
    const directoryName = `Test Series S01E01 ${mockDownloadedMediaIndicator}`;
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    const mediaFileName = "test_S01E02_episode.mkv";
    fs.writeFileSync(path.join(testDirPath, mediaFileName), "dummy content");

    (readlineSync.question as jest.Mock).mockReturnValue("2");

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(true);
    expect(readlineSync.question).toHaveBeenCalledTimes(1);
  });

  it("should return false when user chooses Option 2 and no 'S01E02' file exists", () => {
    const directoryName = `Test Series S01E01 ${mockDownloadedMediaIndicator}`;
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    // Add a non-matching file
    fs.writeFileSync(path.join(testDirPath, "another_file.txt"), "dummy content");

    (readlineSync.question as jest.Mock).mockReturnValue("2");

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(false);
    expect(readlineSync.question).toHaveBeenCalledTimes(1);
  });

  it("should return true for a directory with media files (original behavior, no prompt)", () => {
    const directoryName = `Test Series S01E02 ${mockDownloadedMediaIndicator}`;
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    const mediaFileName = "episode.mkv";
    fs.writeFileSync(path.join(testDirPath, mediaFileName), "dummy content");

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(true);
    expect(readlineSync.question).not.toHaveBeenCalled();
  });

  it("should return false if directory name does not have downloaded indicator, even with media files", () => {
    const directoryName = "Test Series S01E03"; // No indicator
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    const mediaFileName = "episode.mkv";
    fs.writeFileSync(path.join(testDirPath, mediaFileName), "dummy content");

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(false);
    expect(readlineSync.question).not.toHaveBeenCalled();
  });

   it("should return false and not prompt if directory is not marked as downloaded and has no media files", () => {
    const directoryName = "Another Series S01E01"; // No indicator
    const testDirPath = path.join(tempTestDir, directoryName);
    fs.mkdirSync(testDirPath);

    (readlineSync.question as jest.Mock).mockReturnValue("1"); // Mock this just in case

    const result = mediaCheckerInstance.isDownloadedMediaDirectory(testDirPath);
    expect(result).toBe(false);
    expect(readlineSync.question).not.toHaveBeenCalled();
  });
});

describe("isTvShowFile", () => {
  it.each([
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
