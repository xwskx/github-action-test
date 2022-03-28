const core = require('@actions/core');
const fs = require('fs')

const lock = '{}'
const package = (project_name) => `{
  'name': '${project_name}'
}`

// most @actions toolkit packages have async methods
function run() {
  try {
    console.log(fs.readFileSync('/home/runner/work/_temp/_github_workflow/event.json','utf8'))
    console.log('------------------------')
    console.log(process.env)
    if (! fs.existsSync('.dbx')) {
      fs.mkdirSync('.dbx')
    }
    fs.writeFileSync('.dbx/lock.json', lock)
    fs.writeFileSync('.dbx/package.json', package('hello-world-123'))
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
