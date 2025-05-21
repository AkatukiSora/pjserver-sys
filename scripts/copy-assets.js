import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../src');
const destDir = path.resolve(__dirname, '../dist');

async function copyNonTsFiles(src, dest) {
  await fs.ensureDir(dest);
  const items = await fs.readdir(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = await fs.stat(srcPath);

    if (stat.isDirectory()) {
      await copyNonTsFiles(srcPath, destPath);
    } else {
      if (!srcPath.endsWith('.ts')) {
        await fs.copy(srcPath, destPath);
      }
    }
  }
}

copyNonTsFiles(srcDir, destDir)
  .then(() => {
    console.log('Non-.ts files copied successfully.');
  })
  .catch((err) => {
    console.error('Error copying files:', err);
    process.exit(1);
  });
