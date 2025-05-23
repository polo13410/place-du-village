import fs, { promises as fsp } from 'fs';
import path from 'path';
import { open as openZip } from 'yauzl';
import { ZipFile } from 'yazl';

export async function extractZip(localZipPath: string, extractTo: string = './') {
    await new Promise<void>((resolve, reject) => {
        openZip(localZipPath, { lazyEntries: true }, (err, zipFile) => {
            if (err) return reject(err);
            zipFile.readEntry();
            zipFile.on('entry', (entry) => {
                const entryPath = path.join(extractTo, entry.fileName);
                if (entry.fileName.endsWith('/')) {
                    fsp.mkdir(entryPath, { recursive: true }).then(() => zipFile.readEntry());
                } else {
                    // Ensure parent directory exists before writing file
                    fsp.mkdir(path.dirname(entryPath), { recursive: true }).then(() => {
                        zipFile.openReadStream(entry, (err, readStream) => {
                            if (err) return reject(err);
                            const writeStream = fs.createWriteStream(entryPath);
                            readStream.pipe(writeStream);
                            writeStream.on('close', () => zipFile.readEntry());
                        });
                    }).catch(reject);
                }
            });
            zipFile.on('end', () => {
                zipFile.close();
                resolve();
            });
            zipFile.on('error', reject);
        });
    });
}

export async function createZipFromFolder(folder: string, zipFilePath: string) {
    const zipFile = new ZipFile();
    const addFolderToZip = (folderPath: string, basePath: string) => {
        const files = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(folderPath, file.name);
            const relativePath = path.join(basePath, file.name);
            if (file.isDirectory()) {
                addFolderToZip(fullPath, relativePath);
            } else {
                zipFile.addFile(fullPath, relativePath);
            }
        }
    };
    // Add the folder itself as the root in the zip
    addFolderToZip(folder, path.basename(folder));
    await new Promise<void>((resolve, reject) => {
        zipFile.outputStream.pipe(fs.createWriteStream(zipFilePath)).on('close', () => resolve()).on('error', reject);
        zipFile.end();
    });
}

export async function deleteFolderIfExists(dir: string) {
    if (await fsp.stat(dir).then(() => true, () => false)) {
        await fsp.rm(dir, { recursive: true, force: true });
    }
}
