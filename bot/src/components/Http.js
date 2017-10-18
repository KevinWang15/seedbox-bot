/**
 * 需要可以设置retry、设置PHP代理服务器、放入有concurrency限制的request队列
 **/
import { http as httpConfig } from "../config";
import request from "request";

let maxConcurrency = httpConfig.maxConcurrency || 8;
let queue = new Queue(maxConcurrency);

function httpRequest() {
  queue.add(() => {
    return request();
  });
}

export { httpRequest };