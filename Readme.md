# del.icio.us exporter

[![npm version](https://img.shields.io/npm/v/delicious-exporter.svg)](https://www.npmjs.com/package/delicious-exporter) [![Build Status](https://travis-ci.org/knalli/delicious-exporter.svg)](https://travis-ci.org/knalli/delicious-exporter) [![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

Because there is no del.icio.us exporter anymore.

## Why?

[del.icio.us](https://del.icio.us) is a bookmark service, which does not only stores the user's bookmarked 
links with tags, but also let's search and find for related links in the community (i.e. "users who have tagged 
this link also tagged...").

Because the export feature (api) has been removed for a while, I need a export tool. **That it is.** The export is done by scraping the HTML. 

## How to install?
```
npm install -g delicious-exporter
```

## How to use?

### Basic options
Help
```
delicious-exporter --help
```

Download bookmarks for user `knalli`
```
delicious-exporter --username knalli
```

### Advanced options

* The default writes the result into `result.json`. This can be changed with `--output-file otherfile.json`.
* The downloaded data (actually, HTML files only) can be stored: `--write-html output/`
* Instead of re-downloading all files, the files can read by directory (see `--write-html`): `--read-html output/` 

# License

Licensed under MIT.
