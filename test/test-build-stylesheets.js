/*global describe, it, before*/

import chai from "chai";
import buildStylesheets from "../src/build-stylesheets";
import gulp from "gulp"
import path from "path"
import denodeify from "denodeify"
import fsExtra from "fs-extra"
import crypto from "crypto"
const readFile = denodeify(fsExtra.readFile)
const copy = denodeify(fsExtra.copy)
const mkdirp = denodeify(fsExtra.mkdirp)
const expect = chai.expect;

function setup (options = {}) {
  const tmpDir = path.join(__dirname, "..", "tmp", crypto.randomBytes(20).toString('hex'))
  const srcFolderPath = path.join(tmpDir, "less")
  const buildFolderPath = path.join(tmpDir, "build")
  const fixturePath = path.join(__dirname, "fixtures")

  try {
    fsExtra.removeSync(path.join(__dirname, "..", "tmp", "*"))
  }
  catch (e) {
    // this is a cleanup task, which fails on windows sometimes because
    // windows is awful. it doesn't matter if it fails, though. we can just
    // plough on.
  }

  return Promise.all([mkdirp(srcFolderPath), mkdirp(buildFolderPath)]).
  then(() => {
    return copy(fixturePath, srcFolderPath)
  }).then(() => {
    process.chdir(tmpDir)
    const buildPipeline = buildStylesheets({
      src: srcFolderPath,
      dest: path.join(buildFolderPath, "assets"),
      prefix: "assets/"
    })

    const buildStream = gulp.src("less/main.less").
      pipe(buildPipeline).
      pipe(gulp.dest(buildFolderPath))

    return new Promise((resolve, reject) => {
      buildStream.on("end", () => { resolve(buildStream) })
      buildStream.on("error", reject)
    })
  }).then((buildStream) => {
    return Promise.all([
      readFile(path.join(buildFolderPath, "main.css"), "utf8"),
      buildFolderPath
    ])
  })
}

describe("@n3dst4/build-stylesheets", function () {
  before(function () {
    return setup().then(([code, path]) => {
      this.code = code
      this.path = path
    })
  })

  it("should have a build path", function () {
    expect(this.path).to.be.okay
  })

  it("should transform less into css", function () {
    expect(this.code).to.match(/foo bar {\n\s*color: red;\n\s*}\n\n\s*foo baz {\n\s*color: green;\n\s*}\n\n\s*poot {\n\s*background-image: url\(assets\/image-[A-Za-z0-9]+.jpg\);\n\s*}/)
  })

  it("should copy assets into the output folder", function (done) {
    const assets = []
    fsExtra.walk(path.join(this.path, "assets")).
      on("data", (item) => {assets.push(item)}).
      on("end", () => {
        expect(assets).to.have.lengthOf(2)
        expect(assets[1].stats.size).to.equal(2063)
        done()
      })
  })
});
