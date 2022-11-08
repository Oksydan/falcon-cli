const { getCurrentDirectory, fileExists, directoryExists } = require('./helpers/files');
const path = require('path');
const fs = require('fs');
var getDirName = path.dirname;

const getJsFileTemplate = (entry) => `
// Your js code for entry - ${entry}
import '@js/${entry}/index';
`;

const getCssFileTemplate = (entry) => `
@import "abstracts/index";
@import "${entry}/index";
`;

module.exports = class EntryCreator {
  constructor (entryName) {
    this.themeScssPath = '';
    this.themeJsPath = '';
    this.entryName = entryName;
    this.existingEntries = [];

    this.getExistingEntries();
  }

  getEntriesFileDirIfExists() {
    const entriesFile = `${getCurrentDirectory()}/webpack/entries.json`;

    return fileExists(entriesFile) ? entriesFile : false
  }

  getEntriesFileAsJson() {
    const entriesFile = this.getEntriesFileDirIfExists();

    if (entriesFile) {
      const rawData = fs.readFileSync(entriesFile);
      const { entries } = JSON.parse(rawData);

      return entries;
    }

    return false;
  }

  getExistingEntries() {
    const entriesJson = this.getEntriesFileAsJson();

    if (entriesJson) {
      this.existingEntries = entriesJson;
    } else {
      throw new Error('Your theme is not compatible with falcon-cli tool')
    }
  }

  setEntryName(name) {
    this.entryName = name;
  }

  setupThemeDirs() {
    this.themeScssPath = this.getThemeScssPath();
    this.themeJsPath = this.getThemeJsPath();
  }

  getThemeScssPath() {
    const cssPath = path.resolve(getCurrentDirectory(), './css');

    if (!directoryExists(cssPath)) {
      throw new Error(`CSS theme directory not exists`)
    } else {
      return cssPath;
    }
  }

  getThemeJsPath() {
    const jsPath = path.resolve(getCurrentDirectory(), './js');

    if (!directoryExists(jsPath)) {
      throw new Error(`JS theme directory not exists`)
    } else {
      return jsPath;
    }
  }

  isEntryNameValid() {
    return this.entryName.length > 0 && this.entryName.match(/^(\d|\w)+$/);
  }

  checkIfEntryAlreadyExists() {
    return this.existingEntries.length > 0 && this.existingEntries.find(entry => entry === this.entryName);
  }

  async generateEntry() {
    this.getExistingEntries()
    await this.generateEntryForScss()
    await this.generateEntryForJs()
    await this.addEntryToEntriesFile()
  }

  async writeFile(path, contents) {
    try {
      await fs.promises.mkdir(getDirName(path), { recursive: true })
    } catch (error) {
      throw new Error(error)
    }

    try {
      await fs.promises.writeFile(path, contents)
    } catch (error) {
      throw new Error(error)
    }
  }

  async generateEntryForScss() {
    await this.writeFile(`${this.themeScssPath}/${this.entryName}.scss`, getCssFileTemplate(this.entryName));
    await this.writeFile(`${this.themeScssPath}/${this.entryName}/index.scss`, '');
  }

  async generateEntryForJs() {
    await this.writeFile(`${this.themeJsPath}/${this.entryName}.js`, getJsFileTemplate(this.entryName));
    await this.writeFile(`${this.themeJsPath}/${this.entryName}/index.js`, '');
  }

  async addEntryToEntriesFile() {
    const entries = this.getEntriesFileAsJson()
    const entriesFile = this.getEntriesFileDirIfExists()

    if (entries && entriesFile) {
      entries.push(this.entryName)

      const content = JSON.stringify({entries}, null, 2);

      await this.writeFile(entriesFile, content);
    } else {
      throw new Error('Your theme is not compatible with falcon-cli tool')
    }
  }
}
