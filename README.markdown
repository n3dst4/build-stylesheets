# @n3dst4/build-stylesheets

![Travis status](https://travis-ci.org/n3dst4/build-stylesheets.svg)

An opinionated gulp-compatible stylesheet bundler

## Installation

```sh
npm install @n3dst4/build-stylesheets --save
```

## Usage
```
buildStylesheets(assetOptions, production)
```

## Example

```
import buildStylesheets from "@n3dst4/build-stylesheets"
const production = process.env.NODE_ENV === "production"
gulp.src(path.join("stylesheets", "main.less")).
   pipe(buildStylesheets({
         src: "stylesheets",
         dest: "__generated/css/assets",
         prefix: "assets/"
      }, production).
   pipe(gulp.dest())
```

The `assetOptions` passed in will be passed wholesale to [`rework-assets`](https://github.com/conradz/rework-assets).

The `production` argument will apply minification via [`csso`](https://github.com/css/csso) if true.
