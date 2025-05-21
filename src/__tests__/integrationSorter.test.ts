import fs from "fs-extra";
import path from "path";
import * as os from "os";
import * as readlineSync from 'readline-sync';
import { Sorter } from "../sorter";
import { MediaChecker } from "../mediaChecker";
import { Formatter } from "../formatter";
import { Config } from "../utils/config";
import { Logger } from "../utils/logger";

// Mock readline-sync and Logger
jest.mock('readline-sync');
jest.mock('../utils/logger');

const TEST_DIR_PREFIX = "sorter-integration-test-";
const DOWNLOADS_DIR_NAME = "downloads";
const TV_SHOWS_DIR_NAME = "TV_SHOWS";
const MOVIES_DIR_NAME = "MOVIES";

const DOWNLOADED_MEDIA_INDICATOR = "[DL]";
const MEDIA_SUFFIXES = [".mkv", ".mp4", ".avi"];
const TV_SHOW_PATTERNS = [
  {
    pattern: "(?<title>.+)[. ]S(?<season>\\d{2})E(?<episode>\\d{2})",
    type: "tvshow",
  },
  {
    pattern:
      "(?<title>.+)[. ](?<year>\\d{4})[.]\\d{3,4}p[.].*(?<source>WEB(?:RIP|DL)|BluRay|DVD|HDTV).*",
    type: "movie",
  },
];

describe("Sorter Integration Tests", () => {
  let baseTestDir: string;
  let downloadsDir: string;
  let tvShowsDir: string;
  let moviesDir: string;
  let sorter: Sorter;
  let mediaChecker: MediaChecker;
  let formatter: Formatter;
  let config: Config;

  beforeEach(() => {
    // Create a unique base temporary directory for each test
    baseTestDir = fs.mkdtempSync(path.join(os.tmpdir(), TEST_DIR_PREFIX));

    downloadsDir = path.join(baseTestDir, DOWNLOADS_DIR_NAME);
    tvShowsDir = path.join(baseTestDir, TV_SHOWS_DIR_NAME);
    moviesDir = path.join(baseTestDir, MOVIES_DIR_NAME);

    fs.ensureDirSync(downloadsDir);
    fs.ensureDirSync(tvShowsDir);
    fs.ensureDirSync(moviesDir);

    config = {
      downloadsDir: downloadsDir,
      tvShowsDir: tvShowsDir,
      moviesDir: moviesDir,
      mediaFileSuffixes: MEDIA_SUFFIXES,
      downloadedMediaIndicators: [DOWNLOADED_MEDIA_INDICATOR],
      tvShowPatterns: TV_SHOW_PATTERNS,
      removeEmptyDirs: true,
      dryRun: false,
    } as Config; // Cast to Config to satisfy the Sorter constructor

    formatter = new Formatter(config.tvShowPatterns);
    mediaChecker = new MediaChecker(
      config.downloadedMediaIndicators,
      config.mediaFileSuffixes,
      formatter
    );
    sorter = new Sorter(config, mediaChecker, formatter, new Logger(true));

    // Reset mocks for readlineSync
    (readlineSync.question as jest.Mock).mockReset();
  });

  afterEach(() => {
    // Clean up the base temporary directory and all its contents
    if (baseTestDir) {
      fs.removeSync(baseTestDir);
    }
  });

  describe("Scenario 1: Empty Downloaded Directory - User Chooses to Delete", () => {
    it("should not treat the directory as media and it should not exist if cleanup is effective", () => {
      const emptyDownloadedDirName = `Show.S01.1080p.${DOWNLOADED_MEDIA_INDICATOR}`;
      const emptyDownloadedDirPath = path.join(downloadsDir, emptyDownloadedDirName);
      fs.ensureDirSync(emptyDownloadedDirPath);

      (readlineSync.question as jest.Mock).mockReturnValue("1"); // User chooses to delete

      sorter.sort();

      // Assertions
      expect(fs.pathExistsSync(emptyDownloadedDirPath)).toBe(false); // Directory should be deleted by sorter's cleanup
      expect(sorter.mediaDirectories.size).toBe(0);
      expect((readlineSync.question as jest.Mock)).toHaveBeenCalledTimes(1);
      // Check that no files were moved to TV shows or movies
      expect(fs.readdirSync(tvShowsDir).length).toBe(0);
      expect(fs.readdirSync(moviesDir).length).toBe(0);
    });
  });

  describe("Scenario 2: Empty Downloaded Directory - User Chooses 'S01E02' Pattern - Files Exist", () => {
    it("should move 'S01E02' files to TV shows and cleanup original directory", () => {
      const showName = "Another Show";
      const downloadedDirName = `${showName}.S02.720p.WEB-DL.${DOWNLOADED_MEDIA_INDICATOR}`;
      const downloadedDirPath = path.join(downloadsDir, downloadedDirName);
      fs.ensureDirSync(downloadedDirPath);

      const episodeFileName = `${showName.toLowerCase().replace(" ", ".")}.s01e02.episode.mkv`;
      const otherMediaFileName = "promo.trailer.mp4"; // Will be treated as a movie
      fs.writeFileSync(path.join(downloadedDirPath, episodeFileName), "dummy episode content");
      fs.writeFileSync(path.join(downloadedDirPath, otherMediaFileName), "dummy trailer content");

      (readlineSync.question as jest.Mock).mockReturnValue("2"); // User chooses 'S01E02' pattern

      sorter.sort();

      // Assertions
      expect((readlineSync.question as jest.Mock)).toHaveBeenCalledTimes(1);

      const expectedTvShowPath = path.join(tvShowsDir, showName, "Season 01", episodeFileName);
      expect(fs.pathExistsSync(expectedTvShowPath)).toBe(true);
      
      // The promo trailer should be identified as a movie and moved.
      // The formatter will extract "promo.trailer" as title and no year, so it might go to a default movie folder or one named "promo.trailer"
      // For this test, let's check if it's in the moviesDir root or a subdirectory.
      // A more robust check would involve knowing exactly how formatter handles such files.
      // Assuming it creates a directory for the movie:
      const expectedMoviePath = path.join(moviesDir, "promo.trailer", otherMediaFileName);
      expect(fs.pathExistsSync(expectedMoviePath)).toBe(true);


      // Original directory should be cleaned up as all recognized media was moved
      expect(fs.pathExistsSync(downloadedDirPath)).toBe(false);
    });
  });

  describe("Scenario 3: Empty Downloaded Directory - User Chooses 'S01E02' Pattern - No Such Files Exist", () => {
    it("should not process the directory as media and it should be cleaned up", () => {
      const emptyDownloadedDirName = `Empty.Show.S03.HDR.${DOWNLOADED_MEDIA_INDICATOR}`;
      const emptyDownloadedDirPath = path.join(downloadsDir, emptyDownloadedDirName);
      fs.ensureDirSync(emptyDownloadedDirPath);

      (readlineSync.question as jest.Mock).mockReturnValue("2"); // User chooses 'S01E02' pattern

      sorter.sort();

      // Assertions
      expect((readlineSync.question as jest.Mock)).toHaveBeenCalledTimes(1);
      // Directory should be removed because it's empty and user's choice didn't lead to finding media
      expect(fs.pathExistsSync(emptyDownloadedDirPath)).toBe(false);
      expect(sorter.mediaDirectories.size).toBe(0); // or check specific content
      
      // Check that no files were moved
      expect(fs.readdirSync(tvShowsDir).length).toBe(0);
      expect(fs.readdirSync(moviesDir).length).toBe(0);
    });
  });
});
