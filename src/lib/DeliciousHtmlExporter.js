import fs from "fs";
import request from "request-promise";
import HtmlParser from "./HtmlParser.js";

class RemoteHttpLoader {

  constructor(baseEndpoint, username) {
    this.username = username;
    this.baseEndpoint = baseEndpoint;
  }

  loadPage(page) {
    return new Promise((resolve, reject) => {
      request(`${this.baseEndpoint}/${this.username}?page=${page}`)
        .then(resolve, reject);
    });
  }

}

class LocalFileLoader {

  constructor(filePrefix, fileSuffix) {
    this.filePrefix = filePrefix;
    this.fileSuffix = fileSuffix;
  }

  loadPage(page) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${this.filePrefix}${page}${this.fileSuffix}`, 'utf8', (err, data) => {
        if (err) {
          reject({
                   message: err.message
                 });
        } else {
          resolve(data.toString());
        }
      });
    });
  }

}

class LocalFileWriter {

  constructor(filePrefix, fileSuffix) {
    this.filePrefix = filePrefix;
    this.fileSuffix = fileSuffix;
  }

  savePage(page, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${this.filePrefix}${page}${this.fileSuffix}`, data, 'utf8', (err) => {
        if (err) {
          reject({
                   message: err.message
                 });
        } else {
          resolve();
        }
      });
    });
  }

}

class DeliciousHtmlExporter {

  constructor({username, baseEndpoint = 'https://del.icio.us', writeHtmlToDirectory = false, readHtmlFromDirectory = false}) {
    if (readHtmlFromDirectory) {
      this.loader = new LocalFileLoader(`${readHtmlFromDirectory}/page_`, '.html');
    } else {
      this.loader = new RemoteHttpLoader(baseEndpoint, username);
    }
    if (writeHtmlToDirectory && typeof writeHtmlToDirectory === 'string') {
      if (!fs.existsSync(writeHtmlToDirectory)) {
        fs.mkdirSync(writeHtmlToDirectory);
      }
      this.writer = new LocalFileWriter(`${writeHtmlToDirectory}/page_`, '.html');
    }
    this.parser = new HtmlParser();

    console.log(`Starting del.icio.us HTML exporter for '${username}' @ '${baseEndpoint}'`);
    console.log('  - reading from ' + (readHtmlFromDirectory ? (`<local: '${readHtmlFromDirectory}'>`) : `<remote: ${baseEndpoint}>` ));
    console.log('  - writing results ' + (writeHtmlToDirectory ? (`yes <local: ${writeHtmlToDirectory}>`) : 'no'));
  }

  fetch() {
    return new Promise((resolve, reject) => {
      this.fetchPage()
          .then(response => {
            let combinedResult = {
              title: response.title,
              pages: response.page.total,
              totalElements: response.page.totalElements,
              items: []
            };
            console.log(`Fetched initial page, and now we know how many to load: ${response.page.total} pages, ${response.page.totalElements} items`);
            return this.collectAndFetchNext(response, combinedResult);
          })
          .then(resolve, reject);
    });
  }

  fetchPage(page = 1) {
    return this.loader.loadPage(page)
               .then((html) => {
                 if (this.writer) {
                   this.writer.savePage(page, html)
                       .catch(error => console.error('Failed to write page due: ' + error.message));
                 }
                 return this.parser.parse(html);
               })
               .then(response => {
                 console.log(`Fetched page ${response.page.number}/${response.page.total}`);
                 return response;
               });
  }

  collectAndFetchNext(currentResponse, combinedResult) {
    return new Promise((resolve, reject) => {
      combinedResult.items.push(...currentResponse.items);
      if (currentResponse.page.next) {
        this.fetchPage(currentResponse.page.next)
            .then(nextResponse => this.collectAndFetchNext(nextResponse, combinedResult))
            .then(resolve, reject);
      } else {
        resolve(combinedResult);
      }
    });
  }

}

export default DeliciousHtmlExporter;
