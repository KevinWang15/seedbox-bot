import fs from "fs";

const CORE_SETTINGS_PATH = "./core_settings.json";
const defaults = {
  proxyEnabled: false,
  proxyHost: "127.0.0.1",
  proxyPort: 1080,
  proxyUsername: "",
  proxyPassword: "",
  userTaskInterval: 30,
  newUserScanInterval: 60,
  newTorrentsProtectionPeriod: 180,
  downloadingTorrentsProtectionPeriod: 86400,
  retryFailedTorrentsAfter: 60,
  $version: +new Date(),
};

function readCoreSettings() {
  if (!fs.existsSync(CORE_SETTINGS_PATH))
    createDefaultCoreSettings();
  return Object.assign({...defaults}, JSON.parse(fs.readFileSync(CORE_SETTINGS_PATH, { encoding: "UTF8" })));
}

function createDefaultCoreSettings() {
  fs.writeFileSync(CORE_SETTINGS_PATH, JSON.stringify(defaults, null, 4), { encoding: "UTF8" })
}

export { readCoreSettings, createDefaultCoreSettings };