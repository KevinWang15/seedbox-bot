import "babel-polyfill";
import { ScanAndAddNewUsers } from "./methods/ScanAndAddNewUsers";
import { system as systemConfig } from './config';
import { Exception } from "./models/Exception";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 每一分钟扫描一下users表，看是否有新的用户加入
ScanAndAddNewUsers();
setInterval(ScanAndAddNewUsers, (systemConfig.newUserScanInterval || 60) * 1000);


process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  Exception.create({
    ref_id: 0,
    source: "unhandledRejection",
    exception: 'Unhandled Rejection at: Promise' + p.toString() + 'reason:' + reason.toString() + ', stack:' + reason.stack,
    user_id: 0,
  });
});
