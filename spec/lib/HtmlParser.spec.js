import fs from "fs";
import HtmlParser from "./../../src/lib/HtmlParser.js";

describe('lib/HtmlParser', () => {
  const parser = new HtmlParser();

  it('parse() available', () => {
    expect(parser.parse).toBeDefined();
  });

  describe('parse invalid input', () => {

    it('undefined', (done) => {
      parser.parse()
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

    it('null', (done) => {
      parser.parse(null)
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

    it('number', (done) => {
      parser.parse(1)
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

    it('boolean', (done) => {
      parser.parse(true)
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

    it('object non string', (done) => {
      parser.parse({})
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

    it('empty string', (done) => {
      parser.parse('')
            .then(() => {
              done.fail('Should not be successful');
            }, (err) => {
              expect(err.message).toBe('No valid source given');
              done();
            });
    });

  });

  describe('parsing valid input', () => {

    describe('demo page 1', () => {

      const source = fs.readFileSync(__dirname + '/../fixtures/knalli-page1.html')
                       .toString();

      it('source is valid string', () => {
        expect(Object.prototype.toString.call(source)).toBe('[object String]');
      });

      it('verify result', (done) => {
        parser.parse(source)
              .then((result) => {
                expect(result.title).toBe('Jan\'s Bookmarks (User knalli)');

                //page
                expect(result.page.totalElements).toBe(1321, 'page.totalElements');
                expect(result.page.windowStart).toBe(1, 'page.windowStart');
                expect(result.page.windowEnd).toBe(10, 'page.windowEnd');
                expect(result.page.elements).toBe(10, 'page.elements');
                expect(result.page.number).toBe(1, 'page.number');
                expect(result.page.total).toBe(133, 'page.total');
                expect(result.page.prev).not.toBeDefined('page.prev');
                expect(result.page.next).toBe(2, 'page.next');

                // items
                expect(result.items.length).toBe(10, 'items.length');
                expect(result.items[0].id).toEqual('d815f2de5650c2e6c98a03abd44d4857', 'item.id');
                expect(result.items[0].created).toEqual(new Date(1475235047000), 'item.date');
                expect(result.items[0].title).toEqual('Use xcodebuild (Xcode 8) and automatic signing in CI (Travis/Jenkins) environments - Stack Overflow', 'item.title');
                expect(result.items[0].url).toEqual('http://stackoverflow.com/questions/39500634/use-xcodebuild-xcode-8-and-automatic-signing-in-ci-travis-jenkins-environmen', 'item.url');
                expect(result.items[0].count).toBe(1, 'item.count');
                expect(result.items[0].tags.length).toBe(0, 'item.tags.length');

                expect(result.items[7].id).toEqual('b0962d7f488611f5334a1219d8da7ee3', 'item.id');
                expect(result.items[7].created).toEqual(new Date(1455374290000), 'item.date');
                expect(result.items[7].title).toEqual('Desmos | Beautiful, Free Math');
                expect(result.items[7].url).toEqual('https://www.desmos.com/', 'item.url');
                expect(result.items[7].count).toBe(100, 'item.count');
                expect(result.items[7].tags.length).toBe(6, 'item.tags.length');
                expect(result.items[7].tags).toEqual(['math', 'graphing', 'tools', 'mathematics', 'mathtools', 'plotting'], 'item.tags');

                done();
              }, (err) => {
                done.fail(err.message);
              });
      }, 5000);

    });

    describe('demo page 2', () => {

      const source = fs.readFileSync(__dirname + '/../fixtures/knalli-page133.html')
                       .toString();

      it('source is valid string', () => {
        expect(Object.prototype.toString.call(source)).toBe('[object String]');
      });

      it('verify result', (done) => {
        parser.parse(source)
              .then((result) => {
                console.log(result);
                expect(result.title).toBe('Page 133 of Jan\'s Bookmarks (User knalli)');

                //page
                expect(result.page.totalElements).toBe(1321, 'page.totalElements');
                expect(result.page.windowStart).toBe(1321, 'page.windowStart');
                expect(result.page.windowEnd).toBe(1321, 'page.windowEnd');
                expect(result.page.elements).toBe(1, 'page.elements');
                expect(result.page.number).toBe(133, 'page.number');
                expect(result.page.total).toBe(133, 'page.total');
                expect(result.page.prev).toBe(132, 'page.prev');
                expect(result.page.next).not.toBeDefined('page.next');

                // items
                expect(result.items.length).toBe(1, 'items.length');

                done();
              }, (err) => {
                done.fail(err.message);
              });
      }, 5000);

    });

  });

});
