import HtmlParser from './../../src/lib/HtmlParser.js';

describe('lib/HtmlParser', () => {
  const parser = new HtmlParser();

  it('parse() available', () => {
    expect(parser.parse).isDefined();
  });
});
