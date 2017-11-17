import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";

//TODO: error handling

// refer to https://github.com/Novik/ruTorrent/blob/master/plugins/httprpc/action.php#L91-L97
const ARRAY_INDEX = {
  name: 4,
  size: 5,
  done_size: 8,
  up_total: 9,
  ratio: 10,
  up_rate: 11,
  down_rate: 12,
  tag: 14,
};

class ruTorrentClient {
  cookieJar = null;
  boxConfig = null;

  constructor(boxConfig) {
    this.boxConfig = boxConfig;
  }

  async login() {
    // ruTorrent没有login
    this.cookieJar = request.jar();
    return true;
  }


  // [{ size, upspeed, added_on, dlspeed, category }]
  async getTorrentsList() {
    let result = await this.requestWithRetry({
      jar: this.cookieJar,

      url: urlJoin(this.boxConfig.url, 'plugins/httprpc/action.php'),
      form: 'mode=list&cmd=d.custom%3Dseedingtime&cmd=d.custom%3Daddtime',
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });

    if (result.error || result.response.statusCode !== 200) {
      throw result.error;
    }

    let parsedData = [];
    let age = 0;
    try {
      let raw_data = JSON.parse(result.body).t;
      for (let key in raw_data) {
        if (!raw_data.hasOwnProperty(key) || !raw_data[key] instanceof Object || !raw_data[key].length) continue;
        parsedData.push({
          // old torrents come first
          age: age--,
          hash: key,
          name: raw_data[key][ARRAY_INDEX.name],
          upspeed: +raw_data[key][ARRAY_INDEX.up_rate],
          dlspeed: +raw_data[key][ARRAY_INDEX.down_rate],
          ratio: +raw_data[key][ARRAY_INDEX.ratio],
          size: +raw_data[key][ARRAY_INDEX.size],
          done_size: +raw_data[key][ARRAY_INDEX.done_size],
          seedTime: parseTime(raw_data[key][raw_data[key].length - 2]),
          added_on: +(raw_data[key][raw_data[key].length - 1].replace(/\s/g, '')),
          category: raw_data[key][ARRAY_INDEX.tag],
          upall: +raw_data[key][ARRAY_INDEX.up_total],
        });
      }
    } catch (e) {
      throw e;
    }
    return parsedData;
  }

  async addTorrent(url) {
    return await this.requestWithRetry({
      jar: this.cookieJar,
      url: urlJoin(this.boxConfig.url, `php/addtorrent.php`),
      form: { "url": url },
      auth: {
        username: this.boxConfig.basic_auth_username,
        password: this.boxConfig.basic_auth_password,
      },
      method: "POST",
    });
  }

  async deleteTorrents(torrentsToDelete) {
    let error = null;
    for (let i = 0; i < torrentsToDelete.length; i++) {
      let r = await this.requestWithRetry({
        jar: this.cookieJar,
        url: urlJoin(this.boxConfig.url, 'plugins/httprpc/action.php'),
        body: deleteTorrentXmlCommandTemplate(torrentsToDelete[i].hash),
        headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
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

  async requestWithRetry(params) {
    if (!this.cookieJar) {
      await this.login();
    }
    return await httpRequest({ ...params, jar: this.cookieJar });
  }
}

function parseTime(seedTime) {
  seedTime = seedTime.replace(/\s/g, '');
  if (!seedTime) return 0;
  return Math.floor(+new Date() / 1000) - seedTime;
}

function deleteTorrentXmlCommandTemplate(hash) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
   <methodName>system.multicall</methodName>
   <params>
      <param>
         <value>
            <array>
               <data>
                  <value>
                     <struct>
                        <member>
                           <name>methodName</name>
                           <value>
                              <string>d.custom5.set</string>
                           </value>
                        </member>
                        <member>
                           <name>params</name>
                           <value>
                              <array>
                                 <data>
                                    <value>
                                       <string>${hash}</string>
                                    </value>
                                    <value>
                                       <string>1</string>
                                    </value>
                                 </data>
                              </array>
                           </value>
                        </member>
                     </struct>
                  </value>
                  <value>
                     <struct>
                        <member>
                           <name>methodName</name>
                           <value>
                              <string>d.delete_tied</string>
                           </value>
                        </member>
                        <member>
                           <name>params</name>
                           <value>
                              <array>
                                 <data>
                                    <value>
                                       <string>${hash}</string>
                                    </value>
                                 </data>
                              </array>
                           </value>
                        </member>
                     </struct>
                  </value>
                  <value>
                     <struct>
                        <member>
                           <name>methodName</name>
                           <value>
                              <string>d.erase</string>
                           </value>
                        </member>
                        <member>
                           <name>params</name>
                           <value>
                              <array>
                                 <data>
                                    <value>
                                       <string>${hash}</string>
                                    </value>
                                 </data>
                              </array>
                           </value>
                        </member>
                     </struct>
                  </value>
               </data>
            </array>
         </value>
      </param>
   </params>
</methodCall>`
}

export default ruTorrentClient;