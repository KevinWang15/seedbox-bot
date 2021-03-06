const fs = require('fs');
const rimraf = require('rimraf');
const _exec = require('child_process').execSync;

const installSh = `#!/usr/bin/env bash
cd "$(dirname "$0")"
npm install -g forever sequelize-cli
forever stop seedbox-bot-server
forever stop seedbox-bot-bot
chmod -R 777 bot
cd bot
mkdir torrents
chmod -R 777 torrents
npm install --production
cd ../server
npm install --production
sequelize db:migrate
node scripts/create-user.js
cd ..
forever --id "seedbox-bot-server" --workingDir server start server/index.js
forever --id "seedbox-bot-bot" --workingDir bot start bot/index.js
echo 安装完成，在端口10120上运行`;

const installWithCnpmSh = `#!/usr/bin/env bash
cd "$(dirname "$0")"
sudo -E cnpm install -g forever sequelize-cli
forever stop seedbox-bot-server
forever stop seedbox-bot-bot
cd bot
mkdir torrents
chmod -R 777 torrents
cnpm install --production
cd ../server
cnpm install --production
sequelize db:migrate
node scripts/create-user.js
cd ..
forever --id "seedbox-bot-server" --workingDir server start server/index.js
forever --id "seedbox-bot-bot" --workingDir bot start bot/index.js
echo 安装完成，在端口10120上运行`;

const bootSh = `#!/usr/bin/env bash
cd "$(dirname "$0")"
forever stop seedbox-bot-server
forever stop seedbox-bot-bot
forever --id "seedbox-bot-server" --workingDir server start server/index.js
forever --id "seedbox-bot-bot" --workingDir bot start bot/index.js
`;

let dirsToDelete = ['production-bundle', 'bot/out', 'server/out', 'ui/build'];
let deletionPromises = [];
dirsToDelete.forEach(dir => {
  if (fs.existsSync(dir)) {
    deletionPromises.push(new Promise(res => {
      rimraf(dir, (_) => {
        res(_);
      });
    }));
  }
});

Promise.all(deletionPromises).then(_ => {
  if (_.filter(_ => _).length) {
    // deletion failed
    console.log(_.filter(_ => _));
    process.exit(-1);
  }

  fs.mkdirSync('production-bundle');

  console.log("compiling bot");
  process.chdir('bot');
  exec("npm run compile");
  exec("cp -r out ../production-bundle/bot");
  exec("cp package.json ../production-bundle/bot");
  process.chdir('../server');
  console.log("compiling server");
  exec("npm run compile");
  exec("cp -r out ../production-bundle/server");
  exec("cp package.json ../production-bundle/server");
  process.chdir('../ui');
  console.log("compiling ui");
  exec("npm run build");
  exec("cp -r build ../production-bundle/server/ui");

  process.chdir('../production-bundle/');
  fs.writeFileSync("install.sh",
    installSh, {
      encoding: 'utf8',
    })
  fs.writeFileSync("install-with-cnpm.sh",
    installWithCnpmSh, {
      encoding: 'utf8',
    })
  fs.writeFileSync("boot.sh",
    bootSh, {
      encoding: 'utf8',
    })
  fs.chmodSync('install.sh', 0o755);
  fs.chmodSync('install-with-cnpm.sh', 0o755);
  fs.chmodSync('boot.sh', 0o755);
  fs.chmodSync('server/scripts/create-user.js', 0o755);
  fs.chmodSync('server/scripts/export-config.js', 0o755);
  fs.chmodSync('server/scripts/import-config.js', 0o755);
});

function exec(cmd) {
  console.log(_exec(cmd, {
    encoding: 'utf8',
  }));
}