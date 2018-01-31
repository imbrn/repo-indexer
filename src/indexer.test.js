import indexer from "./indexer.js";
import mockfs from "mock-fs";
import fs from "fs";

describe("the indexer function", function() {
  describe("indexing when only root contains data", function() {
    beforeAll(() => {
      mockfs({
        "one.txt": "One",
        "two.txt": "Two"
      });
      indexer();
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should create _index folder at root", () => {
      expect(fs.existsSync("./_index")).toBeTruthy();
    });

    test("api.json should contain correct data", () => {
      const apiJson = JSON.parse(fs.readFileSync("./_index/api.json", "utf-8"));
      expect(apiJson).not.toBeNull();
      expect(apiJson).toEqual({
        size: 2,
        items: {
          "one.txt": "one.txt",
          "two.txt": "two.txt"
        }
      });
    });
  });

  describe("indexing simple structure", function() {
    beforeAll(() => {
      mockfs({
        data: {
          "one.txt": "one",
          "two.txt": "two"
        }
      });
      indexer(); // Indexes the root folder
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should create an _index folder at root", () => {
      expect(fs.existsSync("./_index")).toBeTruthy();
    });

    test("should create a correct api.json for root", () => {
      const apiJson = JSON.parse(fs.readFileSync("./_index/api.json", "utf-8"));
      expect(apiJson).toEqual({
        size: 1,
        items: {
          data: "_index/data"
        }
      });
    });

    test("should create correct api.json for the data folder", () => {
      const apiJson = JSON.parse(
        fs.readFileSync("./_index/data/api.json", "utf-8")
      );
      expect(apiJson).toEqual({
        size: 2,
        items: {
          "one.txt": "data/one.txt",
          "two.txt": "data/two.txt"
        }
      });
    });
  });

  describe("indexing two level structure", function() {
    beforeAll(() => {
      mockfs({
        data: {
          subdata: {
            "one.txt": "one",
            "two.txt": "two"
          },
          "three.txt": "three",
          "four.txt": "four"
        }
      });
      indexer();
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should create _index folder at root", () => {
      expect(fs.existsSync("./_index")).toBeTruthy();
    });

    test("should create correct api.json for the _index folder", () => {
      const apiJson = JSON.parse(fs.readFileSync("./_index/api.json", "utf-8"));
      expect(apiJson).not.toBeNull();
      expect(apiJson).toEqual({
        size: 1,
        items: { data: "_index/data" }
      });
    });

    test("should create correct api.json the data folder", () => {
      const apiJson = JSON.parse(
        fs.readFileSync("./_index/data/api.json", "utf-8")
      );
      expect(apiJson).not.toBeNull();
      expect(apiJson).toEqual({
        size: 3,
        items: {
          subdata: "_index/data/subdata",
          "three.txt": "data/three.txt",
          "four.txt": "data/four.txt"
        }
      });
    });

    test("should create correct api.json for the subdata folder", () => {
      const apiJson = JSON.parse(
        fs.readFileSync("./_index/data/subdata/api.json", "utf-8")
      );
      expect(apiJson).not.toBeNull();
      expect(apiJson).toEqual({
        size: 2,
        items: {
          "one.txt": "data/subdata/one.txt",
          "two.txt": "data/subdata/two.txt"
        }
      });
    });
  });

  describe("indexing folder with old _index", function() {
    beforeAll(() => {
      mockfs({
        _index: {
          "api.json": "",
          old_folder: {
            old_file: "Old file"
          }
        },
        "one.txt": "One",
        "two.txt": "Two"
      });
      indexer();
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should completely delete the old _index folder", () => {
      expect(fs.existsSync("./_index/old_folder")).toBeFalsy();
    });

    test("should create a new _index folder", () => {
      expect(fs.existsSync("./_index")).toBeTruthy();
    });

    test("should replace api.json", () => {
      const apiJson = JSON.parse(fs.readFileSync("_index/api.json", "utf-8"));
      expect(apiJson).toEqual({
        size: 2,
        items: {
          "one.txt": "one.txt",
          "two.txt": "two.txt"
        }
      });
    });
  });

  describe("ignoring always ignored patterns", function() {
    beforeAll(() => {
      mockfs({
        ".git": { HEAD: "" },
        ".gitignore": "",
        node_modules: { a_package: "" },
        bower_components: { another_package: "" },
        _index: { data: "" },
        "package.json": "",
        "package-lock.json": "",
        "yarn.lock": "",
        "gulpfile.js": "",
        "bower.json": "",
        "README.md": "",
        LICENSE: "",
        "LICENSE.txt": "",
        "not_ignored_data.txt": "",
        "_description.json": "{}"
      });
      indexer();
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should contain only not ignored data", () => {
      const apiJson = JSON.parse(fs.readFileSync("./_index/api.json", "utf-8"));
      expect(apiJson).toEqual({
        size: 1,
        items: {
          "not_ignored_data.txt": "not_ignored_data.txt"
        }
      });
    });
  });

  describe("merging description file into api.json", function() {
    beforeAll(() => {
      mockfs({
        "_description.json": "{ \"name\": \"Root folder\" }",
        "data1.txt": "data1",
        "sub-folder": {
          "_description.json": "{ \"name\": \"Data two\", \"value\": 15 }",
          "data2.txt": "data2"
        }
      });
      indexer();
    });

    afterAll(() => {
      mockfs.restore();
    });

    test("should merge description for the root folder", () => {
      const apiJson = JSON.parse(fs.readFileSync("_index/api.json", "utf-8"));
      expect(apiJson).toEqual({
        size: 2,
        items: {
          "data1.txt": "data1.txt",
          "sub-folder": "_index/sub-folder"
        },
        name: "Root folder"
      });
    });

    test("should merge description for the sub-folder", () => {
      const apiJson = JSON.parse(
        fs.readFileSync("_index/sub-folder/api.json", "utf-8")
      );
      expect(apiJson).toEqual({
        name: "Data two",
        value: 15,
        size: 1,
        items: {
          "data2.txt": "sub-folder/data2.txt"
        }
      });
    });
  });
});
