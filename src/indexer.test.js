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
});
