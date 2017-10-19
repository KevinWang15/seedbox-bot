/**
 * 需要可以设置retry、设置PHP代理服务器、放入有concurrency限制的request队列
 **/
import { http as httpConfig } from "../config";
import request from "request";
import Queue from 'promise-queue';

let maxConcurrency = httpConfig.maxConcurrency || 8;
let retryCount = httpConfig.retryCount || 3;
let queue = new Queue(maxConcurrency);

function httpRequest(arg) {
  const { auth } = arg;
  return queue.add(() => {
    return new Promise((queue_res) => {
      let req = request({
        followAllRedirects: true,
        ...arg
      }, (error, response, body) => {
        queue_res(body);
      });
      if (auth) req.auth(auth.username, auth.password, true);
      return req;
    });
  });
}

export { httpRequest };