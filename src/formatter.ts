import { config } from "configuration";

export function formatSeriesTitleAndFileName(title: string): string {
  let formattedTitle = title.toLowerCase();
  formattedTitle = createUnifiedSeparator(formattedTitle);
  formattedTitle = removeForbiddenPrefixes(formattedTitle, config.forbiddenPrefixes, config.unifiedSeparator);
  formattedTitle = removeYearAndImdbSuffix(formattedTitle);
  return removeForbiddenCharacters(formattedTitle, config.forbiddenCharacters, config.unifiedSeparator);
}

function createUnifiedSeparator(formattedTitle: string): string {
  formattedTitle.replace(" ", config.unifiedSeparator);
  formattedTitle.replace("_", config.unifiedSeparator);
  return formattedTitle;
}

function removeYearAndImdbSuffix(formattedTitle: string): string {
  throw new Error("Function not implemented.");
}

export function removeForbiddenCharacters(formattedTitle: string, forbiddenCharacters: string[], unifiedSeparator: string): string {
  for (let char of forbiddenCharacters) {
    formattedTitle = formattedTitle.replace(char, "");
  }
  const leadingSeparatorRegex = new RegExp(`^${unifiedSeparator}+`);
  const trailingSeparatorRegex = new RegExp(`${unifiedSeparator}+$`);
  return formattedTitle.replace(leadingSeparatorRegex, '').replace(trailingSeparatorRegex, '');
}

export function removeForbiddenPrefixes(formattedTitle: string, forbiddenPrefixes: string[], unifiedSeparator: string): string {
  for (let prefix of forbiddenPrefixes) {
    prefix = createUnifiedSeparator(prefix);
    const prefixToRemoveRegex = new RegExp(`^${prefix}${unifiedSeparator}*`, "i");
    formattedTitle = formattedTitle.replace(prefixToRemoveRegex, "");
  }
  const thePrefixToRemoveRegex = new RegExp(`^The${unifiedSeparator}*`, "i");
  return formattedTitle.replace(thePrefixToRemoveRegex, "");
}
