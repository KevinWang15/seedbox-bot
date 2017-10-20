import { httpRequest } from "../components/Http";
import request from "request";
import urlJoin from "url-join";
import { EnsureSpace } from "./EnsureSpace";
import { cookieJars } from "../mem/CookieJars";

//TODO: loginQb 加锁
//TODO: safe_add 流程，也需要加锁
async function LoginQb(boxConfig) {
  let cookieJar = request.jar();
  await httpRequest({
    jar: cookieJar,
    url: boxConfig.url,
    form: { username: boxConfig.username, password: boxConfig.password },
    auth: { username: boxConfig.username, password: boxConfig.password },
    method: "POST",
  });

  cookieJars[boxConfig.url] = cookieJar;
}
async function AddTorrentToQb(boxConfig, url) {
  if (!cookieJars[boxConfig.url]) {
    await LoginQb(boxConfig);
  }

  let hasSpaceAvailable = await EnsureSpace(boxConfig);

  if (hasSpaceAvailable) {
    let result = await httpRequest({
      jar: cookieJars[boxConfig.url],
      url: urlJoin(boxConfig.url, '/command/download'),
      form: { urls: url },
      auth: { username: boxConfig.username, password: boxConfig.password },
      method: "POST",
    });
    return !result.error;
  } else {
    return false;
  }
}


export { AddTorrentToQb };