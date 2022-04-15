#! /usr/bin/env node

import { Command } from 'commander';
import { launchScripts, LaunchScriptsOptions } from './script';
import fs from 'fs';
import path from 'path';
import { Instance as Chalk } from 'chalk';

const chalk = new Chalk({ level: 2 });

const ocs = new Command();

ocs
  .name('ocs')
  .addHelpText(
    'afterAll',
    `
Example:
    ocs ./test.ocs
    ocs D:/ocs/test.ocs
`
  )
  .argument('file', 'path of ocs file')
  .option('--cwd [path]', "working directory of the Node.js process (default: 'process.cwd()')")
  .action(async (config, options) => {
    const cwd = options.cwd || process.cwd();
    const filePath = path.resolve(cwd, config);
    try {
      const file = fs.readFileSync(filePath).toString();
      try {
        const options: LaunchScriptsOptions = JSON.parse(file);

        try {
          await launchScripts(options);
        } catch (e) {
          error('运行错误', e);
        }
      } catch (e) {
        error('文件格式错误', e);
      }
    } catch (e) {
      error('文件不存在', e);
    }

    function error (msg: string, e: any) {
      console.log(`\n${chalk.bgRedBright('[OCS] error : ')} ${msg} : ${filePath}\n\n${(e as Error).stack}\n`);
    }
  })

  .parse();
