import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure the dist-electron directory exists
const distElectronDir = path.join(__dirname, 'dist-electron');
if (!fs.existsSync(distElectronDir)) {
    fs.mkdirSync(distElectronDir, { recursive: true });
}

// Compile main.cjs and preload.cjs using esbuild
const buildCommands = [
    `esbuild electron/main.cjs --bundle --platform=node --outfile=dist-electron/main.cjs --format=cjs --external:electron --external:electron-store`,
    `esbuild electron/preload.cjs --bundle --platform=node --outfile=dist-electron/preload.cjs --format=cjs --external:electron`,
];

buildCommands.forEach(command => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Build output: ${stdout}`);
    });
});