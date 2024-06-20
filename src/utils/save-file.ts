import { writeFile } from 'fs/promises';

async function saveFile(path: string, data: Buffer): Promise<void> {
  try {
    await writeFile(path, data);

    this.logger.log(`File ${path} saved`);
  } catch (err) {
    this.logger.error(`Can't save file ${path}, message: ${err}`);
  }
}

export { saveFile };
