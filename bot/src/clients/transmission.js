import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";
import sleep from 'sleep-promise';

class TransmissionClient {
  cookieJar = null;
  boxConfig = null;
  XTransmissionSessionId = "";

  constructor(boxConfig) {
    this.boxConfig = boxConfig;
  }

  async login() {
    // Transmission没有login
    this.cookieJar = request.jar();
    return true;
  }


  // [{ size, upspeed, added_on, dlspeed, category }]
  async getTorrentsList() {
    let result = await this.requestWithRetry({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/transmission/rpc'),
      body: JSON.stringify({
        "method": "torrent-get",
        "arguments": { "fields": ["id", "hashString", "totalSize", "addedDate", "rateDownload", "rateUpload", "uploadedEver"] },
        "tag": "",
      }),
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    if (result.error || result.response.statusCode !== 200) {
      throw result.error;
    }
    let body = JSON.parse(result.body);
    if (body.result === 'success') {
      return body.arguments.torrents.map(_ => ({
        id: _.id,
        hashString: _.hashString,
        size: _.totalSize,
        upspeed: _.rateUpload,
        upall: _.uploadedEver,
        dlspeed: _.rateDownload,
        added_on: _.addedDate,
        category: "",
      }));
    } else {
      throw body;
    }
  }

  async addTorrent(url) {
    return await this.requestWithRetry({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/transmission/rpc'),
      body: JSON.stringify({
        "method": "torrent-add",
        "arguments": {
          "filename": url,
          "paused": false,
        },
        "tag": "",
      }),
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
  }

  async deleteTorrents(torrentsToDelete) {
    let result = await this.requestWithRetry({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/transmission/rpc'),
      body: JSON.stringify({
        "method": "torrent-remove",
        "arguments": { "ids": torrentsToDelete.map(_ => _.id), "delete-local-data": true },
        "tag": "",
      }),
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    // TR并不返回删除是否成功，因此sleep等待5秒
    await sleep(5000);
    return result;
  }

  async requestWithRetry(_params) {
    let params = {
      ..._params, headers: {
        "X-Transmission-Session-Id": this.XTransmissionSessionId,
      },
    };
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({ ...params, jar: this.cookieJar });
    if (result.response.statusCode === 409) {
      // 409 Conflict, 需要设置Session-Id
      console.log("got 409, setting X-Transmission-Session-Id to " + result.response.headers['x-transmission-session-id']);
      this.XTransmissionSessionId = result.response.headers['x-transmission-session-id'];
      return await httpRequest({
        ...params, headers: {
          "X-Transmission-Session-Id": this.XTransmissionSessionId,
        },
      });
    } else if (result.response.statusCode === 403 || result.response.statusCode === 401) {
      //需要重新登入
      console.log("got 403, retry..");
      await this.login();
      let result = await httpRequest({ ...params, jar: this.cookieJar });
      if (result.response.statusCode === 403 || result.response.statusCode === 401) {
        throw new Error("Still 403 after retry");
      } else {
        return result;
      }
    } else {
      return result;
    }
  }
}

export default TransmissionClient;