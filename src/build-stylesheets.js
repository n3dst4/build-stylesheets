import csso from "gulp-csso";
import gulpIf from "gulp-if";
import less from "gulp-less"
import multipipe from "multipipe"
import plumber from "gulp-plumber"
import rework from 'gulp-rework';
import reworkAssets from "rework-assets";

export default function (assetOptions, production = false) {
  return multipipe(
    // plumber to catch errors
    plumber(),
    // run everything through LESS, converting URLs to be relative to output
    less({relativeUrls: true}),
    // use "rework" and "rework-assets" to copy fonts, images etc
    rework(reworkAssets(assetOptions)),
    // minify if needed
    gulpIf(production, csso())
  )
}
