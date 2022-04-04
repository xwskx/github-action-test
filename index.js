const fs = require('fs');
const core = require('@actions/core');

const lock = '{}'
const project = (repo_name) => `{
  "environments": {
    "default": {
      "profile": "DEFAULT",
      "workspace_dir": "/Shared/dbx/${repo_name}",
      "artifact_location": "dbfs:/Shared/dbx/projects/${repo_name}"
    }
  }
}`

const default_new_cluster = (repo_name, aws_id, aws_secret, pypi_account, pypi_token) => `{
  "spark_version": "9.1.x-scala2.12",
  "node_type_id": "i3.xlarge",
  "spark_conf": {
    "spark.speculation": true,
    "spark.sql.execution.arrow.enabled": "true",
    "spark.databricks.delta.autoCompact.enabled": "true",
    "spark.databricks.delta.optimizeWrite.enabled": "true",
    "spark.databricks.adaptive.autoOptimizeShuffle.enabled": "true",
    "fs.s3a.access.key": "${aws_id}",
    "fs.s3a.secret.key": "${aws_secret}"
  },
  "spark_env_vars": {
    "JOB_NAME": "${repo_name}",
    "PYPI_ACCOUNT": "${pypi_account}",
    "PYPI_TOKEN": "${pypi_token}"
  },
  "init_scripts": [
    {
      "dbfs": {
        "destination": "dbfs:/databricks/init-scripts/set-private-pip-wsk.sh"
      }
    }
  ],
  "aws_attributes": {
    "first_on_demand": 1,
    "availability": "SPOT_WITH_FALLBACK",
    "zone_id": "us-west-2d",
    "spot_bid_price_percent": 100,
    "ebs_volume_count": 0
  },
  "autoscale": {
    "min_workers": 1,
    "max_workers": 8
  }
}`

const default_failure_alert = {
  "on_failure": [
    'wayne.kim@bigbear.ai'
  ]
}

function prune(node) {
  result = false;
  for (var i in node) {
    value = node[i]
    if ((typeof (value) == 'string' && !value.trim()) || (typeof (value) == 'object' && Object.keys(value).length == 0)) {
      delete (node[i])
      return true
    }
    if (node[i] !== null && typeof (node[i]) == "object") {
      if (result = prune(node[i])) {
        break;
      }
    }
  }
  return result
}

function run() {
  try {
    let inputOpt = { required: true, trimWhitespace: true }
    const repo_name = core.getInput('repo_name', inputOpt)
    const aws_id = core.getInput('aws_id', inputOpt)
    const aws_secret = core.getInput('aws_secret', inputOpt)
    const pypi_account = core.getInput('pypi_account', inputOpt)
    const pypi_token = core.getInput('pypi_token', inputOpt)
    const deployment_file = core.getInput('deployment_file') ? core.getInput('deployment_file') : 'conf/deployment.json'

    if (!fs.existsSync('.dbx')) {
      core.info('.dbx directory created')
      fs.mkdirSync('.dbx')
    }
    fs.writeFileSync('.dbx/lock.json', lock)
    core.info('lock.json file generated')
    fs.writeFileSync('.dbx/project.json', project(repo_name))
    core.info('project.json file generated')

    // remove empty string and object
    core.info('pruning deployment json file')
    deployment = JSON.parse(fs.readFileSync(deployment_file, 'utf8'))
    while (prune(deployment)) {
      continue
    }

    jobs = deployment['default']['jobs']
    for (j in jobs) {
      job = jobs[j]
      // auto generate job name
      if (!job['name']) {
        job['name'] = jobs.length == 1 ? repo_name : repo_name + `-${j}`
        core.info('auto assigning job name: ' + job['name'])
      }
      // set default cluster setting if not defined
      if (!job['new_cluster'] && !job['existing_cluster_id']) {
        job['new_cluster'] = JSON.parse(default_new_cluster(repo_name, aws_id, aws_secret, pypi_account, pypi_token))
        core.info(`using default new cluster configuration`)
      }
      // set max current runs to 1 if not defined
      if (!job['max_concurrent_runs']) {
        job['max_concurrent_runs'] = 1
        core.info(`using default max concurrent runs`)
      }
      // set default on failure email address
      if (!job['email_notifications'] || !job['email_notifications']['on_failure']) {
        job['email_notifications'] = default_failure_alert;
        core.info(`using default failure alert`)
      }
    }
    if (!fs.existsSync('conf/')) {
      fs.mkdirSync('conf')
    }
    fs.writeFileSync('conf/deployment.json', JSON.stringify(deployment, null, '  '))
    core.info('conf/deployment.json file generated')
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
