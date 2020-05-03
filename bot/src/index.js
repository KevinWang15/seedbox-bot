import "babel-polyfill";
import {sequelize} from "./databaseConnection";
import "./models";
import {ScanAndAddNewUsers} from "./methods/ScanAndAddNewUsers";
import {Exception} from "./models/Exception";
import {readCoreSettings} from "./utils/coreSettings";

let coreSettings = readCoreSettings();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

sequelize.sync().then(() => {
  setInterval(() => {
    let coreSettings2 = readCoreSettings();
    if (coreSettings2.$version !== coreSettings.$version) {
      console.log("Core Settings changed, restarting..");
      process.exit();
    }
  }, 10000);

  // 每一分钟扫描一下users表，看是否有新的用户加入
  ScanAndAddNewUsers();
  setInterval(ScanAndAddNewUsers, (coreSettings.newUserScanInterval || 60) * 1000);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  Exception.create({
    ref_id: 0,
    source: "unhandledRejection",
    exception: 'Unhandled Rejection at: Promise' + p.toString() + 'reason:' + reason.toString() + ', stack:' + reason.stack,
    user_id: 0,
  });
  process.exit();
});
