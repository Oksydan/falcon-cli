#! /usr/bin/env node

const supportedNodeVersions = "^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0";
const { nodeModuleChecker } = require('./src/helpers/node');
const { errorLog } = require('./src/helpers/log');
const { getCurrentDirectory } = require('./src/helpers/files');

if (!nodeModuleChecker(supportedNodeVersions)) {
  errorLog(
    'You are using Node ' + process.version + ', but this CLI tool requires Node ' + supportedNodeVersions + '.\nPlease upgrade your Node version.'
  );

  process.exit(1)
}

const commander = require('commander')

commander
  .version(`starter/cli ${require(`${getCurrentDirectory()}/package`).version}`)
  .usage('<command> [options]')

commander
  .command('init')
  .action(() => {
    require('./src/actions/init')()
  });

commander
  .command('add-entry')
  .action(() => {
    require('./src/actions/addEntry')()
  });


commander.parse(process.argv)
