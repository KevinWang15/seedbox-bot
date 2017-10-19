import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";

//TODO: loginQb 加锁
//TODO: safe_add 流程
const qbCookies = {};
async function LoginQb(boxConfig) {
  let cookieJar = request.jar();
  await httpRequest({
    jar: cookieJar,
    url: boxConfig.url,
    form: { username: boxConfig.username, password: boxConfig.password },
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });

  qbCookies[boxConfig.url] = cookieJar;
}
async function AddTorrentToQb(boxConfig, url) {
  if (!qbCookies[boxConfig.url]) {
    await LoginQb(boxConfig);
  }

  let result = await httpRequest({
    jar: qbCookies[boxConfig.url],
    url: urlJoin(boxConfig.url, '/command/download'),
    form: { urls: url },
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });

  return !result.error;
}


export { AddTorrentToQb };