import "babel-polyfill";
import { ScanAndAddNewUsers } from "./methods/ScanAndAddNewUsers";
import { system as systemConfig } from './config';
import { Exception } from "./models/Exception";
import { BoxConfig } from "./models/BoxConfig";
import { CheckIfHasSpace } from "./methods/FreeUpSpace";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 每一分钟扫描一下users表，看是否有新的用户加入
ScanAndAddNewUsers();
setInterval(ScanAndAddNewUsers, (systemConfig.newUserScanInterval || 60) * 1000);

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
});
