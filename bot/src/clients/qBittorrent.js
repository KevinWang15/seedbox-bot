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
    //TODO: 在调用处，返回false时做相应处理
    //TODO: cookie过期时间？
    let cookieJar = request.jar();

    if (!this.boxConfig.username || !this.boxConfig.password) {
      this.cookieJar = cookieJar;
      return true;
    }
    console.log("Posting LoginClient Request", urlJoin(this.boxConfig.url, '/login'));
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
    console.log("LoginClient Request Result:", result.errors, result.body, result.response ? result.response.statusCode : null);

    if (result.errors || result.response.statusCode !== 200) {
      return false;
    }
    this.cookieJar = cookieJar;
    return true;
  }

  // [{ size, upspeed, added_on, dlspeed, category }]
  async getTorrentsList() {
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/query/torrents'),
      form: {},
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    if (result.error) {
      throw result.error;
    }
    return JSON.parse(result.body);
  }

  async addTorrent(url) {
    if (!this.cookieJar) {
      await this.login();
    }
    return await httpRequest({
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
    console.log('torrentsToDelete', torrentsToDelete);
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({
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
}

export default qBittorrentClient;