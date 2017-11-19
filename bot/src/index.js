import cluster from "cluster";
import "babel-polyfill";
import { sequelize } from "./databaseConnection";
import "./models";
import { ScanAndAddNewUsers } from "./methods/ScanAndAddNewUsers";
import { Exception } from "./models/Exception";
import { CheckIfHasSpace } from "./methods/FreeUpSpace";
import { readCoreSettings } from "./utils/coreSettings";
let coreSettings = readCoreSettings();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}


if (cluster.isWorker) {
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
}


// async function test() {
//   let box = await BoxConfig.find({
//     where: {
//       id: 1,
//     },
//   });
//
//   for (let i = 0; i < 5; i++) {
//     console.log("CheckingIfHasSpace");
//     let result = await CheckIfHasSpace(box, 300).then(_ => {
//       console.log('hasSpace', _.hasSpace, 'spaceToFreeUp', _.spaceToFreeUp);
//     });
//
//     console.log(result);
//   }
// }
// test();

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
