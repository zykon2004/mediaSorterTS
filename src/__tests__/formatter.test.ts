import { SeasonEpisodePatternNotFound } from "../formatter.ts";
import { formatter } from "./fixtures.ts";

describe("formatTvShowTitleAndFileName", () => {
  it.each([
    ["number is not removed since it is not a year", "Catch 22", "catch.22"],
    [
      "Removed `The`, lower, removed Year",
      "The Mandalorian 2018",
      "mandalorian",
    ],
    [
      "removed imdb identifier and unified separator",
      "Catch 22_tt5056196",
      "catch.22",
    ],
    [
      "removed imdb identifier and :",
      "Avatar: The Last Airbender tt9018736",
      "avatar.the.last.airbender",
    ],
    [
      "TV show file name - lower, without `the`",
      "The.Mandalorian.S02E02.Chapter.10.1080p.DSNP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENiX.mkv",
      "mandalorian.s02e02.chapter.10.1080p.dsnp.web-dl.ddp.5.1.atmos.h.264-phoenix.mkv",
    ],
    [
      "TV show file name - lower, without `UIIndex`",
      "www.UIndex.org    -    Daredevil.Born.Again.S01E07.1080p.WEB.H264-SuccessfulCrab",
      "daredevil.born.again.s01e07.1080p.web.h264-successfulcrab",
    ],
    [
      "TV show file name - lower, without `torrenting.com` and `The`",
      "www.Torrenting.com - The Day Of The Jackal S01E10 1080p NOW WEB-DL DDP5 1 Atmos H 264-FLUX",
      "day.of.the.jackal.s01e10.1080p.now.web-dl.ddp5.1.atmos.h.264-flux",
    ],
    [
      "TV show file name - lower, forbidden, unified",
      "S.W.A.T.2017.S07E10.1080p_HDTV_;;x265-MiNX[TGx]",
      "s.w.a.t.2017.s07e10.1080p.hdtv.x265-minx[tgx]",
    ],
  ])('%s: formats "%s" to "%s"', (_testId, title, formattedTitle) => {
    expect(formatter.formatTvShowTitleAndFileName(title)).toBe(formattedTitle);
  });
});
describe("formatTvShowFilenameBeforeRename", () => {
  it.each([
    [
      "Normal case. prefix deleted, capitalized, episode and season extracted",
      "The.Mandalorian.S02E02.Chapter.10.1080p.DSNP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENiX.mkv",
      "The Mandalorian 2018",
      "Mandalorian - 02x02.mkv",
    ],
    [
      "avi file, dots in name",
      "S.W.A.T.2017.S07E10.1080p_HDTV_;;x265-MiNX[TGx].avi",
      "S.W.A.T 2017",
      "S.W.A.T - 07x10.avi",
    ],
  ])(
    '%s: formats "%s", "%s" to "%s"',
    (_testId, filename, title, expectedFilename) => {
      expect(formatter.formatTvShowFilenameBeforeRename(filename, title)).toBe(
        expectedFilename,
      );
    },
  );
});

describe("formatTvShowFilenameBeforeRename exception handling", () => {
  it.each([
    [
      "No exception is raised. season, episode format found",
      "The.Mandalorian.S02E02.Chapter.10.1080p.DSNP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENiX.mkv",
      "The Mandalorian 2018",
      false,
    ],
    [
      "Did not found SXXEYY pattern, should throw SeasonEpisodePatternNotFound",
      "S.W.A.T 2017",
      "S.W.A.T 2017",
      true,
    ],
  ])("$id", (_testId, filename, title, shouldThrow) => {
    const testFn = () => {
      formatter.formatTvShowFilenameBeforeRename(filename, title);
    };

    if (shouldThrow) {
      expect(testFn).toThrow(SeasonEpisodePatternNotFound);
      // Optionally, check the error message
      expect(testFn).toThrow(`Didn't find SXXEYY pattern in ${filename}`);
    } else {
      // Expecting no exception
      expect(testFn).not.toThrow();
    }
  });
});
describe("E2E Format TV Show Title and Filename", () => {
  it.each([
    [
      "mismatched title and filename",
      "The Office tt0386676",
      "The.Mandalorian.S02E02.Chapter.10.1080p.DSNP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENiX.mkv",
      false,
    ],
    [
      "matching title and filename, removing `the`, removing suffix",
      "Mandalorian 2018",
      "The.Mandalorian.S02E02.Chapter.10.1080p.DSNP.WEB-DL.DDP.5.1.Atmos.H.264-PHOENiX.mkv",
      true,
    ],
  ])("$id", (_testId, title, filename, expectedResult) => {
    const formattedTitle = formatter.formatTvShowTitleAndFileName(title);
    const formattedFilename = formatter.formatTvShowTitleAndFileName(filename);
    expect(formattedFilename.startsWith(formattedTitle)).toBe(expectedResult);
  });
});
