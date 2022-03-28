const core = require('@actions/core');
const fs = require('fs')

const lock = '{}'
const project = (project_name) => `{
  "environments": {
    "default": {
      "profile": "DEFAULT",
      "workspace_dir": "/Shared/dbx/${project_name}",
      "artifact_location": "dbfs:/Shared/dbx/projects/${project_name}"
    }
  }
}`

function run() {
  try {
    const events = JSON.parse(fs.readFileSync(process.env['GITHUB_EVENT_PATH'],'utf8'))
    const repoName = events['repository']['name']
    if (! fs.existsSync('.dbx')) {
      fs.mkdirSync('.dbx')
    }
    fs.writeFileSync('.dbx/lock.json', lock)
    fs.writeFileSync('.dbx/project.json', project(repoName))
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
