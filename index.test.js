const process = require('process');
const cp = require('child_process');
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_REPO_NAME'] = 'test-project-name';
  process.env['INPUT_AWS_ID'] = 'AWS_ID';
  process.env['INPUT_AWS_SECRET'] = 'AWS_SECRET';
  process.env['INPUT_PYPI_ACCOUNT'] = 'PYPI_ACCOUNT';
  process.env['INPUT_PYPI_TOKEN'] = 'PYPI_TOKEN';
  process.env['INPUT_DEPLOYMENT_FILE'] = 'deployment-test.json'
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})
