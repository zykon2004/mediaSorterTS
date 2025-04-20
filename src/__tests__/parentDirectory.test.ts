import {ParentDirectory} from "../parentDirectory.ts";
import {config, formatter} from "./fixtures.ts";
import path from "path";

test('ParentDirectory assign files to proper path', () => {
    const parentDirectory = new ParentDirectory(path.join(config.tvShowDir, "Avatar: The Last Airbender tt12345"), formatter);
    parentDirectory.assignFile("Avatar The Last Airbender s01e02 BLALALSDS 1080p REPACK.mkv")
    const firstAssignedFile = parentDirectory.newlyAssignedFiles.values().next().value as string;
    expect(parentDirectory.resolveNewFilePath(firstAssignedFile)).toBe(path.join(parentDirectory.directoryPath, "Avatar: The Last Airbender - 01x02.mkv"))
});
