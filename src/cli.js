#! /usr/bin/env node
import indexer from "./indexer.js";
import project from "../package.json";

const args = process.argv.slice(2);

if (args.length === 0) {
  indexer();
} else {
  if (args[0] === "-v" || args[0] === "--version") {
    console.log(project.version);
  }
}
