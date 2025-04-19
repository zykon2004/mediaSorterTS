import type {AppConfig} from "../AppConfig.ts";

export const testConfig: AppConfig = {
    tvShowDir: "",
    moviesDir: "",
    downloadsDir: "",
    downloadedMediaIndicators: [],
    mediaFileSuffixes: [],
    defaultTitleSeparator: " ",
    unifiedSeparator: ".",
    forbiddenCharacters: [";", ":"],
    torrentClientURL: "",
    torrentClientUsername: "",
    torrentClientPassword: "",
    tvShows: [],
    forbiddenPrefixes: ["www.UIndex.org    -    ", "www.Torrenting.com - "],
};
