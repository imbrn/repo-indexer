# repo-indexer

**repo-indexer** is a tool to generate an indexed representation of an static repo.

This is useful if you want to share data using your repo as it was an API.

## How to use?

Run this command inside the repo you want to index:

```shell
npx repo-indexer
```

If you're using `npm` before version `5.2`, then you can do:

```shell
npm i -g repo-indexer
repo-indexer
```

## How does it work?

The **repo-indexer** crawls your repo looking for files and folders, then it creates an `_index` folder in the root of the repo, containing an indexed representation of this repo. But instead of copying files inside the folder, it creates an `api.json` for each folder, containing information about the files inside that folder. Information like quantity of files, sub-folders and files links are present in a `api.json` file.

This can be very useful if you want to keep a public repo for sharing data across different clients. The `_index` folder can be used as an entry point for your data as a `read-only` Restful API.

## Example

### An imaginary repository

Imagine you have some repository like this:

+ en_pt/
  + hello.json
  + computer.json
+ pt_es/
  + futebol.json
  + escola.json

### Indexing the repository data

Then inside this repository folder, you run:

`npx repo-indexer`

It will generate an `_index` folder in the root of your repository:

+ _index/
+ ...

### The _index folder

The `_index` folder will have an structure which represents your repository structure, but instead of the real files, it will contain indexes files, called `api.json`:

+ _index/
  + **api.json**
  + en_pt/
    + **api.json**
  + pt_es/
    + **api.json**

### The api.json file

For each folder in your repository, inside the `_index` folder will contain an `api.json` file which represents that folder. This file is what you can think as an API end point for your folder data.

For example, for the file `_index/api.json` you get a file like this:

```json
{
  "size": 2,
  "items": {
    "en_pt": "_index/en_pt/",
    "pt_es": "_index/pt_es"
  }
}
```

You can see that this file contains information about the content inside your repository root folder.

With this file in hand, you can now access each part of your repository as it was a Restful API.

For the `_index/en_pt/api.json` file, you'll have:

```json
{
  "size": 2,
  "items": {
    "hello.json": "en_pt/hello.json",
    "computer.json": "en_pt/computer.json"
  }
}
```

Notice that the `items` section contains links to the real location of the files inside your directory.

You can get the content of this file as it was an API end point, and then use this real content to get data.

### End point

If the repository is hosted in GitHub, you can access it as an API, using URLs:

`https://githubusercontent.com/<user>/<repository>/master/en_pt/api.json`
`https://githubusercontent.com/<user>/<repository>/master/pt_es/api.json`