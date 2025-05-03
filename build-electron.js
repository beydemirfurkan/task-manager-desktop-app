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

// Compile main.js and preload.js using esbuild
const buildCommands = [
    `esbuild electron/main.js --bundle --platform=node --outfile=dist-electron/main.js --format=esm`,
    `esbuild electron/preload.js --bundle --platform=node --outfile=dist-electron/preload.js --format=esm`,
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