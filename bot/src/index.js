import "babel-polyfill";
import { ScanAndAddNewUsers } from "./methods/ScanAndAddNewUsers";
import { system as systemConfig } from './config';

// 每一分钟扫描一下users表，看是否有新的用户加入
ScanAndAddNewUsers();
setInterval(ScanAndAddNewUsers, (systemConfig.newUserScanInterval || 60) * 1000);
