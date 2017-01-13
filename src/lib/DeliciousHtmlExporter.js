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

class DeliciousHtmlExporter {

  constructor({username, baseEndpoint = 'https://del.icio.us', writeHtmlToDisk = false}) {
    this.filePrefix = 'output/page_';
    this.fileSuffix = '.html';
    this.username = username;
    this.baseEndpoint = baseEndpoint;
    this.writeHtmlToDiskEnabled = writeHtmlToDisk;
    this.loader = new LocalFileLoader(this.filePrefix, this.fileSuffix);
    //this.loader = new RemoteHttpLoader(this.baseEndpoint, this.username);
    this.parser = new HtmlParser();
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
                 if (this.writeHtmlToDiskEnabled) {
                   this.writeHtmlToDisk(page, html);
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
      combinedResult.items.concat(currentResponse.items);
      if (currentResponse.page.next) {
        this.fetchPage(currentResponse.page.next)
            .then(nextResponse => this.collectAndFetchNext(nextResponse, combinedResult))
            .then(resolve, reject);
      } else {
        resolve(combinedResult);
      }
    });
  }

  writeHtmlToDisk(page, htmlString) {
    fs.writeFile(`${this.filePrefix}${page}${this.fileSuffix}`, 'utf8', htmlString);
  }

}

export default DeliciousHtmlExporter;
