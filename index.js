const core = require('@actions/core');
const fs = require('fs')

const lock = '{}'
const package = (project_name) => `{
  'name': '${project_name}'
}`

// most @actions toolkit packages have async methods
function run() {
  try {
    const events = JSON.parse(fs.readFileSync(process.env['GITHUB_EVENT_PATH'],'utf8'))
    console.log(events)
    console.log(events['repository']['name'])
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
