import { log } from "console";
import type { AppConfig } from "./AppConfig.ts";

export class Formatter {
  private config: AppConfig;
  escapeRegExp = (str: string) =>
    str.replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&");
  private readonly separator: string;
  private readonly escapedSeparator: string;
  constructor(config: AppConfig) {
    this.config = config;
    this.config.forbiddenPrefixes.push("The");
    this.separator = this.config.unifiedSeparator;
    this.escapedSeparator = this.escapeRegExp(this.separator);
  }

  formatSeriesTitleAndFileName(title: string): string {
    let formattedTitle = title.toLowerCase();
    formattedTitle = this.createUnifiedSeparator(formattedTitle);
    formattedTitle = this.removeForbiddenPrefixes(formattedTitle);
    formattedTitle = this.removeYearAndImdbSuffix(formattedTitle);
    formattedTitle = this.removeForbiddenCharacters(formattedTitle);
    return formattedTitle;
  }

  private createUnifiedSeparator(formattedTitle: string): string {
    return formattedTitle
      .replaceAll(" ", this.separator)
      .replaceAll("_", this.separator);
  }

  private removeForbiddenPrefixes(formattedTitle: string): string {
    for (let prefix of this.config.forbiddenPrefixes) {
      prefix = this.createUnifiedSeparator(prefix);
      const prefixToRemoveRegex = new RegExp(
        `^${prefix}[${this.escapedSeparator} ]*`,
        "i",
      );
      formattedTitle = formattedTitle.replace(prefixToRemoveRegex, "");
    }
    return formattedTitle;
  }
  private removeYearAndImdbSuffix(
    formattedTitle: string,
    separator: string = this.separator,
  ): string {
    const titleSuffix = formattedTitle.split(separator).at(-1);
    if (titleSuffix === formattedTitle) {
      throw TitleWithoutSuffix;
    }
    const escapedSeparator = this.escapeRegExp(separator);
    // Dont use RegExp because adding `\` before `\d` is required
    if (titleSuffix?.match(/^(tt\d+|\d{4})$/)) {
      return formattedTitle.replace(
        new RegExp(`${escapedSeparator}${titleSuffix}$`),
        "",
      );
    }
    return formattedTitle;
  }

  private removeForbiddenCharacters(formattedTitle: string): string {
    for (let char of this.config.forbiddenCharacters) {
      formattedTitle = formattedTitle.replaceAll(char, "");
    }
    const leadingSeparatorRegex = new RegExp(`^${this.escapedSeparator}+`);
    const trailingSeparatorRegex = new RegExp(`${this.escapedSeparator}+$`);
    return formattedTitle
      .replace(leadingSeparatorRegex, "")
      .replace(trailingSeparatorRegex, "");
  }
  /**
   * Extracts the season and episode numbers from a series filename.
   * Assumes the format "sXXeYY" case-insensitive.
   *
   * @param filename The input filename string.
   * @returns A tuple containing the season (two digits) and episode (two digits) as strings.
   * @throws SeasonEpisodePatternNotFound if the expected pattern is not found.
   */
  extractSeasonAndEpisodeFromSeriesFilename(
    filename: string,
  ): [string, string] {
    const seriesSeasonAndEpisodeRegex = /s(\d{2})e(\d{2})/i;
    const match = filename.match(seriesSeasonAndEpisodeRegex);

    if (match && match[1] && match[2]) {
      return [match[1], match[2]];
    }

    throw new SeasonEpisodePatternNotFound(
      `Didn't find SXXEYY pattern in ${filename}`,
    );
  }
  formatSeriesFilenameBeforeRename(filename: string, title: string): string {
    const [season, episode] =
      this.extractSeasonAndEpisodeFromSeriesFilename(filename);
    let formatedTitle = this.removeYearAndImdbSuffix(
      title,
      this.config.defaultTitleSeparator,
    );
    formatedTitle = this.removeForbiddenPrefixes(formatedTitle);
    return `${formatedTitle} - ${season}x${episode}.${filename.split(".").at(-1)}`;
  }
}
export class SeasonEpisodePatternNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeasonEpisodePatternNotFound";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SeasonEpisodePatternNotFound);
    }
  }
}
export class TitleWithoutSuffix extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TitleWithoutSuffix ";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TitleWithoutSuffix);
    }
  }
}
