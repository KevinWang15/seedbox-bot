import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";
import logger from '../logger'

class uTorrentClient {
  cookieJar = null;
  boxConfig = null;
  boxUrl = "";
  token = "";

  normalizeBoxUrl(url) {
    let match = /(.+?\/\/[^\/]+\/gui\/?)/im.exec(url);
    if (match !== null) {
      return match[1] + (match[1].endsWith('/') ? "" : "/");
    } else {
      return urlJoin(url, "gui/");
    }
  }

  constructor(boxConfig) {
    this.boxConfig = boxConfig;
    this.boxUrl = this.normalizeBoxUrl(this.boxConfig.url);
  }

  async login() {
    let cookieJar = request.jar();
    let result = await httpRequest({
      jar: cookieJar,
      url: this.urlJoin(this.boxUrl, '/token.html'),
      headers: {
        "Authorization": this.getAuthorizationHeader(),
      },
    });
    let match = />([^<>]+?)<\/div>/im.exec(result.body);
    if (match !== null) {
      this.token = match[1];
      logger.info("this token set to", this.token);
    } else {
      throw new Error("Token not found");
    }
    this.cookieJar = cookieJar;
    return true;
  }

  getAuthorizationHeader() {
    return "Basic " + Buffer.from(unescape(encodeURIComponent(
        (this.boxConfig.basic_auth_username || "") + ":" + (this.boxConfig.basic_auth_password || ""),
      ))).toString('base64');
  }


  // [{ size, upspeed, added_on, dlspeed, category }]
  async getTorrentsList() {

    if (!this.cookieJar) {
      await this.login();
    }

    let result = await this.requestWithRetry({
      jar: this.cookieJar,
      url: this.urlJoin(this.boxUrl, `/?token=${this.token}&list=1`),
      headers: {
        "Authorization": this.getAuthorizationHeader(),
      },
    });

    if (result.error || result.response.statusCode !== 200) {
      throw result.error;
    }

    let body = JSON.parse(result.body);

    // http://help.utorrent.com/customer/en/portal/articles/1573947-torrent-labels-list---webapi
    return body.torrents.map(_ => ({
      hash: _[0],   // 字符串
      size: _[3],   // bytes
      upspeed: _[8],   // bytes/s
      upall: _[6],   // bytes
      dlspeed: _[9],   // bytes/s
      added_on: _[23],   // timestamp/1000 (seconds since Unix epoch)
      category: _[11] // 字符串
    }));
  }

  urlJoin(url1, url2) {
    return url1 + (url1.endsWith('/') ? '' : '/') + (url2.startsWith('/') ? url2.substring(1) : url2);
  }

  async addTorrent(url) {
    if (!this.cookieJar) {
      await this.login();
    }
    return await this.requestWithRetry({
      jar: this.cookieJar,
      url: this.urlJoin(this.boxUrl, `/?token=${this.token}&action=add-url&s=${encodeURIComponent(url)}`),
      headers: {
        "Authorization": this.getAuthorizationHeader(),
      },
    });
  }

  async deleteTorrents(torrentsToDelete) {
    if (!this.cookieJar) {
      await this.login();
    }
    let error = null;
    for (let i = 0; i < torrentsToDelete.length; i++) {
      let r = await this.requestWithRetry({
        jar: this.cookieJar,
        url: this.urlJoin(this.boxUrl, `/?token=${this.token}&action=removedatatorrent&hash=${torrentsToDelete[i].hash}`),
        headers: {
          "Authorization": this.getAuthorizationHeader(),
        },
      });
      if (r.error) {
        if (!error) error = [];
        error.push(r.error);
      }
    }
    return { error };
  }

  async requestWithRetry(params) {
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({ ...params, jar: this.cookieJar });
    if (result.response && (result.response.statusCode === 401)) {
      //需要重新登入
      logger.warn("got 401, retry..");
      await this.login();
      let result = await httpRequest({ ...params, jar: this.cookieJar });
      if (result.response && (result.response.statusCode === 401)) {
        throw new Error("Still 401 after retry");
      } else {
        return result;
      }
    } else {
      return result;
    }
  }
}

export default uTorrentClient;