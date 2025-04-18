import { config } from "configuration";

export function formatSeriesTitleAndFileName(title: string): string {
  let formatted_title = title.toLowerCase();
  formatted_title = createUnifiedSeparator(formatted_title);
  formatted_title = removeForbiddenPrefixes(formatted_title, config.forbiddenCharacters, config.unifiedSeparator);
  formatted_title = removeYearAndImdbSuffix(formatted_title);
  return removeForbiddenCharacters(formatted_title);
}

function createUnifiedSeparator(formatted_title: string): string {
  formatted_title.replace(" ", config.unifiedSeparator);
  formatted_title.replace("_", config.unifiedSeparator);
  return formatted_title;
}

export function removeForbiddenPrefixes(formatted_title: string, forbiddenCharacters: string[], unifiedSeparator: string): string {
  for (let char of forbiddenCharacters) {
    formatted_title = formatted_title.replace(char, "");
  }
  const leadingSeparatorRegex = new RegExp(`^${unifiedSeparator}+`);
  const trailingSeparatorRegex = new RegExp(`${unifiedSeparator}+$`);
  return formatted_title.replace(leadingSeparatorRegex, '').replace(trailingSeparatorRegex, '');
}

function removeYearAndImdbSuffix(formatted_title: string): string {
  throw new Error("Function not implemented.");
}

function removeForbiddenCharacters(formatted_title: string): string {
  throw new Error("Function not implemented.");
}

export function removeAnnoyingPrefix(formattedTitle: string, separator: string = config.unifiedSeparator): string {
    const annoyingPrefixes = ["www.UIndex.org    -   ", "www.Torrenting.com -"];
    let prefixToRemove = "";
    for (const prefix of annoyingPrefixes) {
        const prefixWithUnifiedSeparator = createUnifiedSeparator(prefix);
        if (formattedTitle.startsWith(`${prefixWithUnifiedSeparator}${separator}`)) {
            prefixToRemove = `${prefixWithUnifiedSeparator}${separator}`;
        } else if (formattedTitle.startsWith(`${prefixWithUnifiedSeparator.toLowerCase()}${separator}`)) {
            prefixToRemove = `${prefixWithUnifiedSeparator.toLowerCase()}${separator}`;
        }
    }
    return formattedTitle.replace(prefixToRemove, '');
}
