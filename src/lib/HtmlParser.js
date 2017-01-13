import jsom from "jsdom";

const converters = {
  htmlToDom: (html) => {
    return new Promise((resolve, reject) => {
      jsom.env({
                 html: html,
                 scripts: [
                   'https://code.jquery.com/jquery-1.12.4.min.js',
                 ],
                 features: {
                   SkipExternalResources: true,
                   FetchExternalResources: [], // disable remote resources
                   ProcessExternalResources: [], // disable remote resources
                 },
                 done: (err, window) => {
                   if (err) {
                     reject(err);
                   } else {
                     resolve(window);
                   }
                 }
               })
    });
  }
};

class HtmlParser {

  constructor() {
  }

  parse(source) {
    return new Promise((resolve, reject) => {
      if (!source || typeof source !== 'string') {
        reject({message: 'No valid source given'});
        return;
      }

      converters.htmlToDom(source)
                .then((window) => {
                  try {
                    const jQuery = window.$;

                    const doc = {};
                    doc.title = jQuery('head >title').text();

                    const stats = {};
                    stats.raw = jQuery('h1').text();
                    [, stats.windowStart, stats.windowEnd, stats.total] = stats.raw.match(/Links (\d+) through (\d+) of (\d+) (.+) Bookmarks/);

                    const page = {
                      totalElements: parseInt(stats.total, 10),
                      windowStart: parseInt(stats.windowStart, 10),
                      windowEnd: parseInt(stats.windowEnd, 10),
                      elements: parseInt(stats.windowEnd, 10) - parseInt(stats.windowStart, 10) + 1,
                      number: parseInt(jQuery('.pagination .active').text(), 10),
                    };
                    if (jQuery('.pagination a').is('[aria-label=Next]')) {
                      // safe to use elements
                      page.total = Math.ceil(page.totalElements / page.elements);
                    } else {
                      // "page.elements" is smaller, because last page
                      page.total = page.number;
                    }
                    if (page.number > 1) {
                      page.prev = page.number - 1;
                    }
                    if (page.number < page.total) {
                      page.next = page.number + 1;
                    }

                    const items = jQuery.makeArray(jQuery('.articleThumbBlockOuter'))
                                        .map(jQuery)
                                        .map(($element) => {
                                          return {
                                            id: $element.attr('md5'),
                                            created: new Date(1000 * parseInt($element.attr('date'))),
                                            title: $element.find('.articleTitlePan > h3 > a').data('title'),
                                            url: $element.find('.articleInfoPan > p > a').attr('href'),
                                            count: parseInt($element.find('.articleInfoPan > .savesCount > p').text().match(/(\d+) Saves?/)[1], 10),
                                            tags: jQuery.makeArray($element.find('.thumbTBriefTxt .tagName a'))
                                                        .map((element) => element.innerHTML)
                                          };
                                        });

                    resolve({
                              title: doc.title,
                              page: page,
                              items: items,
                            });
                  } finally {
                    window.close();
                  }
                })
                .catch((err) => {
                  reject({
                           message: err.message
                         })
                });
    });
  }

}

export default HtmlParser;
