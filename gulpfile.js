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

gulp.task("copy_files", function (done) {
  copyFolderRecursiveSync("src", "dist");
  done();
});

gulp.task(
  "prebuild",
  gulp.series("eslint", "prettier", "create-dist", "copy_files"),
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

// ======================================

// ファイルをコピーする関数
function copyFileSync(source, target) {
  let targetFile = target;

  // ターゲットがディレクトリの場合、ファイル名を付け加える
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  if (/.*\.ts$/.test(targetFile)) {
    return;
  }
  // バイナリモードでファイルを読み込む
  let sourceData = fs.readFileSync(source);

  // バイナリモードでファイルを書き込む
  fs.writeFileSync(targetFile, sourceData, { encoding: null });
}

// ディレクトリを再帰的にコピーする関数
function copyFolderRecursiveSync(source, target) {
  let files = [];

  // ソース内のファイルを取得
  if (fs.existsSync(source) && fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
  }

  // ターゲットディレクトリが存在しない場合は作成する
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  // ファイルをコピーする
  files.forEach(function (file) {
    let curSource = path.join(source, file);
    let curTarget = path.join(target, file);

    if (fs.lstatSync(curSource).isDirectory()) {
      // ディレクトリの場合は再帰的に呼び出す
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      // ファイルの場合は単純にコピーする
      copyFileSync(curSource, curTarget);
    }
  });
}
