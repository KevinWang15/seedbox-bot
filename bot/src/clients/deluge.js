import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";
import zlib from "zlib";
import logger from '../logger'

class DelugeClient {
  cookieJar = null;
  boxConfig = null;
  id = 0;

  constructor(boxConfig) {
    this.boxConfig = boxConfig;
  }

  async login() {
    let cookieJar = request.jar();

    if (!this.boxConfig.password) {
      this.cookieJar = cookieJar;
      return true;
    }
    let result = await httpRequest({
      jar: cookieJar,
      url: urlJoin(this.boxConfig.url, '/json'),
      json: true,
      body: { "method": "auth.login", "params": [this.boxConfig.password], "id": this.id++ },
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
    let result = await this.requestWithRetryOn500({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/json'),
      json: true,
      body: {
        "method": "web.update_ui",
        "params": [["queue", "name", "total_wanted", "state", "progress", "num_seeds", "total_seeds", "num_peers", "total_peers", "download_payload_rate", "upload_payload_rate", "eta", "ratio", "distributed_copies", "is_auto_managed", "time_added", "tracker_host", "save_path", "total_done", "total_uploaded", "max_download_speed", "max_upload_speed", "seeds_peers_ratio"], {}],
        "id": this.id++,
      },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    if (result.error || result.response.statusCode !== 200) {
      throw result.error;
    }
    let torrentsMap = JSON.parse(result.body).result.torrents;
    let torrents = [];
    Object.keys(torrentsMap).forEach(hash => {
      let torrent = torrentsMap[hash];
      torrents.push({
        hash: hash,   // 字符串
        size: torrent.total_wanted,   // bytes
        upspeed: torrent.upload_payload_rate,   // bytes/s
        upall: torrent.total_uploaded,   // bytes
        dlspeed: torrent.download_payload_rate,   // bytes/s
        added_on: +((+torrent.time_added).toFixed(0)),   // timestamp/1000 (seconds since Unix epoch)
        category: torrent.tracker_host  // 字符串
      });
    });
    return torrents;
  }

  async addTorrent(url) {
    let downloadTorrentFromUrl = await this.requestWithRetryOn500({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/json'),
      json: true,
      body: { method: "web.download_torrent_from_url", params: [url, ""], "id": this.id++ },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
    return await this.requestWithRetryOn500({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, '/json'),
      json: true,
      body: {
        "method": "web.add_torrents",
        "params": [[{
          "path": JSON.parse(downloadTorrentFromUrl.body).result,
          "options": {},
        }]],
        "id": this.id++,
      },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
  }

  // torrentsToDelete: [{hash}]
  async deleteTorrents(torrentsToDelete) {
    let error = null;
    for (let i = 0; i < torrentsToDelete.length; i++) {
      let r = await this.requestWithRetryOn500({
        jar: this.cookieJar,
        url: urlJoin(this.boxConfig.url, '/json'),
        json: true,
        body: {
          "method": "core.remove_torrent",
          "params": [torrentsToDelete[i].hash, true],
          "id": this.id++,
        },
        auth: {
          username: this.boxConfig.basic_auth_username,
          password: this.boxConfig.basic_auth_password,
        },
        method: "POST",
      });
      if (r.error) {
        if (!error) error = [];
        error.push(r.error);
      }
    }
    return { error };
  }

  unzipGzip(body) {
    return new Promise(res => {
      zlib.unzip(body, (err, buffer) => {
        res(buffer.toString());
      });
    });
  }

  async requestWithRetryOn500(params) {
    if (!this.cookieJar) {
      await this.login();
    }
    let result = await httpRequest({ ...params, jar: this.cookieJar, encoding: null });
    if (result.response && (result.response.statusCode === 500)) {
      //需要重新登入
      logger.warn("got 500, retry..");
      await this.login();
      let result = await httpRequest({ ...params, jar: this.cookieJar, encoding: null });
      if (result.response && (result.response.statusCode === 500)) {
        throw new Error("Still 500 after retry");
      } else {
        result.body = await this.unzipGzip(result.body);
        return result;
      }
    } else {
      result.body = await this.unzipGzip(result.body);
      return result;
    }
  }
}

export default DelugeClient;