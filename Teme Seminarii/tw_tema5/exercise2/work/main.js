import fs from 'fs';
import {rimraf} from 'rimraf';

const dirPath = './output';

if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log(`Directory '${dirPath}' created.`);
}

const filePath = `${dirPath}/example.txt`;
fs.writeFileSync(filePath, 'This is an example file.');
console.log(`File '${filePath}' created.`);

await rimraf(dirPath);
console.log(`Directory '${dirPath}' and its contents have been deleted.`);