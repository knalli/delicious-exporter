import {DeliciousHtmlExporter as Exporter} from "./lib";

const exporter = new Exporter({username: 'knalli', writeHtmlToDisk: true});

exporter.fetch()
        .then((result) => {
          console.log(`Finished, found ${result.items.length} items`);
          fs.writeFile('output/result.json', JSON.stringify(result));
        }, (err) => {
          console.error('FAILED: ' + err);
        });