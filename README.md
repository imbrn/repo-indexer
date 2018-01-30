# repo-indexer

**repo-indexer** is a tool to generate an indexed representation of an static repo.

This is useful if you want to share data using your repo as it was an API.

## How does it work?

The **repo-indexer** crawls your repo looking for files and folders, then it creates an `_index` folder in the root of the repo, containing an indexed representation of this repo. But instead of copying files inside the folder, it creates an `api.json` for each folder, containing information about the files inside that folder. Information like quantity of files, sub-folders and files links are present in a `api.json` file.

This can be very useful if you want to keep a public repo for sharing data across different clients. The `_index` folder can be used as an entry point for your data as a `read-only` Restful API.

## Structure

For a repo structure like this:

```
+ my_repo/
  - my_data_1/
    - one.txt
    - two.txt
  - my_data_2/
    - three.txt
```

The following `_index` folder would be generated:

```
+ _index/
  - api.json
  - my_data_1/
    - api.json
  - my_data_2/
    - api.json
```

The `_index/api.json` would look like this:

```json
{
  "size": 2,
  "items": {
    "my_data_1": "_index/my_data_1",
    "my_data_2": "_index/my_data_2"
  }
}
```

and, `_index/my_data_1/api.json`:

```json
{
  "size": 2,
  "items": {
    "one.txt": "my_data_1/one.txt",
    "two.txt": "my_data_1/two.txt"
  }
}
```

> if a folder child is a sub-folder, the link will point to the sub-folder in the `_index` structure. But if the child is a file, it will point to location of this file into the `repo` structure.