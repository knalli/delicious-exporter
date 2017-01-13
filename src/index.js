import fs from "fs";
import {DeliciousHtmlExporter as Exporter} from "./lib";
import program from "commander";
import pck from "./../package.json";

program.version(pck.version)
       .option('-u --username [username]', 'Your del.icio.us username')
       .option('-e --endpoint [endpoint]', 'The endpoint of the API', 'https://del.icio.us')
       .option('-w --write-html [dir]', 'Each loaded HTML page will be saved in the directory')
       .option('-r --read-html [dir]', 'Instead of loading the pages from the API, it reads them from the directory')
       .option('-o --output-file [file]', 'Result file', 'result.json')
       .parse(process.argv);

if (program.readHtml && program.writeHtml && program.readHtml === program.writeHtml) {
  console.error('You cannot read and write the same data...');
  program.help();
}

if (program.username) {

  const exporter = new Exporter({
    username: program.username,
    baseEndpoint: program.endpoint,
    readHtmlFromDirectory: program.readHtml,
    writeHtmlToDirectory: program.writeHtml,
  });

  exporter.fetch()
          .then((result) => {
            console.log(`Finished, found ${result.items.length} items`);
            fs.writeFile(program.outputFile, JSON.stringify(result));
            console.log(`Result file: ${program.outputFile}`);
          }, (err) => {
            console.error('FAILED: ' + JSON.stringify(err));
          });
}