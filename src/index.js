#! /usr/bin/env node

import fs from "fs";
import {DeliciousHtmlExporter as Exporter} from "./lib";
import program from "commander";
import pck from "./../package.json";

program.version(pck.version)
       .option('-u --username [username]', 'Your del.icio.us username')
       .option('-e --endpoint [endpoint]', 'The endpoint of the API', 'https://del.icio.us')
       .option('-w --write-html [dir]', 'Each loaded HTML page will be saved in the directory (page_1.html, page_2.html, ...)')
       .option('-r --read-html [dir]', 'Instead of loading the pages from the API, it reads them from the directory')
       .option('-o --output-file [file]', 'Result file', 'result.json')
       .option('-v --verify-urls', 'Should the urls being verified if still valid?')
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
    validityOptions: {
      urls: program.verifyUrls
    },
  });

  exporter.fetch()
          .then((result) => {
            console.log(`Finished, found ${result.items.length} items, writing result file...`);
            fs.writeFile(program.outputFile, JSON.stringify(result), 'utf8', (err) => {
              if (err) {
                console.log(`ERROR: Failed writing result file: ${err.message}`);
                process.exit(1);
              } else {
                console.log(`SUCCESS: Result file: ${program.outputFile}`);
                process.exit(0);
              }
            });
          }, (err) => {
            console.error('ERROR: ' + JSON.stringify(err));
            process.exit(1);
          });
}