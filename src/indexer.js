import fs from "fs";
import path from "path";

const alwaysIgnoredPattern = new RegExp(
  "(" +
    [
      "^_index$",
      "node_modules",
      "bower_components",
      ".git",
      ".gitignore",
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "bower.json",
      "gulpfile.js",
      "README.md",
      "LICENSE",
      "LICENSE.txt"
    ].join("|") +
    ")"
);

export default function indexer(
  root = ".",
  options = {
    ignorePattern: /^\..+/
  }
) {
  const indexFolder = makeIndexFolder(root);
  index(root, indexFolder, options);
}

function index(folder, indexFolder, options) {
  if (isIgnored(folder, options)) {
    return;
  }

  const folderPath = path.join(indexFolder, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const apiJson = {
    size: 0,
    items: {}
  };

  fs.readdirSync(folder).forEach(file => {
    const filePath = path.join(folder, file);

    if (!isIgnored(filePath, options)) {
      const fileStat = fs.statSync(filePath);
      let location; // The sub file location in the index system

      if (fileStat.isDirectory()) {
        location = path.join(indexFolder, filePath);
        index(filePath, indexFolder, options);
      } else {
        location = filePath;
      }

      apiJson.size++;
      apiJson.items[file] = location;
    }
  });

  fs.writeFileSync(path.join(folderPath, "api.json"), JSON.stringify(apiJson));
}

function isIgnored(file, options) {
  return (
    alwaysIgnoredPattern.test(file) ||
    (options.ignorePattern && options.ignorePattern.test(file))
  );
}

function makeIndexFolder(root) {
  const indexFolder = path.join(root, "_index");
  forceDeleteFile(indexFolder);
  fs.mkdirSync(indexFolder);
  return indexFolder;
}

function forceDeleteFile(file) {
  if (!fs.existsSync(file)) {
    return;
  }
  const stat = fs.statSync(file);
  if (stat.isDirectory()) {
    fs.readdirSync(file).forEach(childFile => {
      const childPath = path.join(file, childFile);
      forceDeleteFile(childPath);
    });
    fs.rmdirSync(file);
  } else {
    fs.unlinkSync(file);
  }
}
