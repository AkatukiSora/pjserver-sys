import fs from "fs-extra";
import path from "path";

const sourceDir = "src";
const destDir = "dist";

// Ensure the destination directory exists and is clean before copying
fs.emptyDirSync(destDir);

fs.copySync(sourceDir, destDir, {
  filter: (f) => path.extname(f) !== ".ts",
});

console.log(
  `Copied static files from ${sourceDir} to ${destDir}, excluding .ts files.`,
);
