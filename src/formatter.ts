import { log } from "console";
import type { AppConfig } from "./AppConfig.ts";

export class Formatter {
  private config: AppConfig;
  escapeRegExp = (str: string) => str.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&');
  private separator: string;
  private escapedSeparator: string;
  constructor(config: AppConfig) {
    this.config = config;
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
    return formattedTitle.replace(/(_| )/g, this.separator);

  }

  private removeForbiddenPrefixes(formattedTitle: string): string {
    for (let prefix of this.config.forbiddenPrefixes) {
      prefix = this.createUnifiedSeparator(prefix);
      const prefixToRemoveRegex = new RegExp( `^${prefix}${this.escapedSeparator}*`, "i",
      );
      formattedTitle = formattedTitle.replace(prefixToRemoveRegex, "");
    }
    const thePrefixToRemoveRegex = new RegExp( `^The${this.escapedSeparator}*`, "i",);
    return formattedTitle.replace(thePrefixToRemoveRegex, "");
  }
  private removeYearAndImdbSuffix(formattedTitle: string): string {
    const titleSuffix = formattedTitle.split(this.separator).at(-1);
    if (titleSuffix === formattedTitle) {
      throw Error("Title does not contain a suffix");
    }
    if (titleSuffix?.match(/^(tt\d+|\d{4})$/)) {
      return formattedTitle.replace(
        new RegExp(`${this.escapedSeparator}${titleSuffix}$`),
        "",
      );
    }
    return formattedTitle;
  }

  private removeForbiddenCharacters(formattedTitle: string): string {
    for (let char of this.config.forbiddenCharacters) {
      formattedTitle = formattedTitle.replace(new RegExp(char, "g"), "");
    }
    const leadingSeparatorRegex = new RegExp(
      `^${this.escapedSeparator}+`,
    );
    const trailingSeparatorRegex = new RegExp(
      `${this.escapedSeparator}+$`,
    );
    return formattedTitle
      .replace(leadingSeparatorRegex, "")
      .replace(trailingSeparatorRegex, "");
  }
}
