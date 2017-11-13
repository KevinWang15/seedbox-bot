import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";
import sleep from 'sleep-promise';

class qBittorrentClient {
  cookieJar = null;
  boxConfig = null;

  constructor(boxConfig) {
    this.boxConfig = boxConfig;
  }

  async login() {
    let cookieJar = request.jar();

    if (!this.boxConfig.username || !this.boxConfig.password) {
      this.cookieJar = cookieJar;
      return true;
    }
    let result = await httpRequest({
      jar: cookieJar,
      url: urlJoin(this.boxConfig.url, '/login'),
      form: { username: this.boxConfig.username, password: this.boxConfig.password },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    if (result.errors || result.response.statusCode !== 200) {
      return false;
    }
    this.cookieJar = cookieJar;
    return true;
  }

  // [{ size, upspeed, added_on, dlspeed, category }]
  async getTorrentsList() {
    let result = await this.requestWithRetryOn403({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/query/torrents'),
      form: {},
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    if (result.error || result.response.statusCode !== 200) {
      throw result.error;
    }
    return JSON.parse(result.body).map(_ => ({
      ..._,
      upall: _.size * _.progress * _.ratio,
    }));
  }

  async addTorrent(url) {
    return await this.requestWithRetryOn403({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/command/download'),
      form: { urls: url },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
  }

  // torrentsToDelete: [{hash}]
  async deleteTorrents(torrentsToDelete) {
    let result = await this.requestWithRetryOn403({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/command/deletePerm'),
      form: { hashes: torrentsToDelete.map(_ => _.hash).join('|') },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    // QB并不返回删除是否成功，因此sleep等待5秒
    await sleep(5000);
    return result;
  }

  async requestWithRetryOn403(params) {
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({ ...params, jar: this.cookieJar });
    if (result.response && (result.response.statusCode === 403 || result.response.statusCode === 401)) {
      //需要重新登入
      console.log("got 403, retry..");
      await this.login();
      let result = await httpRequest({ ...params, jar: this.cookieJar });
      if (result.response && (result.response.statusCode === 403 || result.response.statusCode === 401)) {
        throw new Error("Still 403 after retry");
      } else {
        return result;
      }
    } else {
      return result;
    }
  }
}

export default qBittorrentClient;