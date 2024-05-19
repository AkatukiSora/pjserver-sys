const gulp = require("gulp");
const fs = require("node:fs");
const path = require("node:path");
const { exec } = require("node:child_process");

gulp.task("eslint", function (done) {
  exec("npx eslint .", (err, stdout, stderr) => {
    if (err) {
      done(stdout);
    }
    done();
  });
});

gulp.task("prettier", function (done) {
  exec("npx prettier . -w", (err, stdout, stderr) => {
    if (err) {
      done(stderr);
    }
    console.log(stdout);
    done();
  });
});

gulp.task("create-dist", function (done) {
  const distPath = path.join(__dirname, "dist");
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }
  done();
});

function copy_files() {
  return gulp
    .src(["src/**/*", "src/**/.*", "!src/**/*.ts", "!src/**/*.js"])
    .pipe(gulp.dest("dist"));
}

gulp.task(
  "prebuild",
  gulp.series("eslint", "prettier", "create-dist", copy_files),
);

gulp.task("compile", function (done) {
  exec("npx tsc -p .", (err, stdout, stderr) => {
    if (err) {
      done(stdout);
    }
    done();
  });
});

gulp.task("compile_test", function (done) {
  exec("npx tsc -p . --noEmit", (err, stderr, stdout) => {
    if (err) {
      done(stderr);
    }
    done();
  });
});

gulp.task("postbuild", function (done) {
  done();
});

gulp.task("build", gulp.series("prebuild", "compile", "postbuild"));

gulp.task("test", gulp.series("eslint", "compile_test"));
