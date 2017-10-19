import "babel-polyfill";
import { ScanAndAddNewUsers } from "./methods/ScanAndAddNewUsers";
import { system as systemConfig } from './config';
import { DownloadAndParseTorrent } from "./methods/DownloadAndParseTorrent";

// 每一分钟扫描一下users表，看是否有新的用户加入
ScanAndAddNewUsers();
setInterval(ScanAndAddNewUsers, (systemConfig.newUserScanInterval || 60) * 1000);

// console.log("testing");
// DownloadAndParseTorrent("https://hdsky.me/download.php?id=57798&passkey=5132e17a655a357e7f4c2ab7c36ec0b8").then(console.log);