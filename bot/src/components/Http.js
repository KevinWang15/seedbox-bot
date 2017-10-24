/**
 * 需要可以设置retry、设置PHP代理服务器、放入有concurrency限制的request队列
 **/
import { http as httpConfig, proxy as proxyConfig } from "../config";
import request from "request";
import Queue from 'promise-queue';

let proxiedRequest;

if (proxyConfig.enabled) {
  const proxyUrl = "http://" + (proxyConfig.username ? (proxyConfig.username + ":" + proxyConfig.password + "@" ) : "") + proxyConfig.host + ":" + proxyConfig.port;
  proxiedRequest = request.defaults({ 'proxy': proxyUrl });
} else {
  proxiedRequest = request.defaults({});
}

let maxConcurrency = httpConfig.maxConcurrency || 8;
let retryCount = httpConfig.retryCount || 3;
let queue = new Queue(maxConcurrency);

function httpRequest(arg) {
  const { auth } = arg;
  return queue.add(() => {
    return new Promise((queue_res) => {
      let req = proxiedRequest({
        followAllRedirects: true,
        ...arg,
        auth: (auth && auth.username && auth.password) ? {
          'user': auth.username,
          'pass': auth.password,
          'sendImmediately': true,
        } : null,
      }, (error, response, body) => {
        queue_res({ error, response, body });
      });
      return req;
    });
  });
}

export { httpRequest };