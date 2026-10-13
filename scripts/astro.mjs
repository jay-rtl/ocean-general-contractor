import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
const args=process.argv.slice(2);
const pkg=JSON.parse(readFileSync('node_modules/astro/package.json','utf8'));
const command=spawn(process.execPath,['node_modules/astro/'+pkg.bin.astro,...args],{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
command.on('exit',code=>process.exit(code??1));
