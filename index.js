#! /usr/bin/env node

const supportedNodeVersions = "^14.0.0 || ^15.0.0 || ^16.0.0";
const { nodeModuleChecker, detectNvm } = require('./helpers/node');
const { error, info } = require('./helpers/log');
const execa = require('execa');

if (!nodeModuleChecker(supportedNodeVersions)) {
  error(
    'You are using Node ' + process.version + ', but this CLI tool requires Node ' + supportedNodeVersions + '.\nPlease upgrade your Node version.'
  );

  process.exit(1)
}

const commander = require('commander')

commander
  .version(`starter/cli ${require('../package').version}`)
  .usage('<command> [options]')

commander
  .command('init')
  .action(() => {
    require('./actions/init')()
  });

commander
  .command('add-entry')
  .action(() => {
    require('./actions/addEntry')()
  });


commander.parse(process.argv)
