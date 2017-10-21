import urlJoin from "url-join";
import { httpRequest } from "../components/Http";
import { FreeUpSpace } from "./FreeUpSpace";
import { cookieJars } from "../mem/CookieJars";
import { LoginQb } from "./LoginQb";

//TODO: loginQb 加锁
//TODO: safe_add 流程，也需要加锁
async function AddTorrentToQb(boxConfig, url) {
  if (!cookieJars[boxConfig.url]) {
    await LoginQb(boxConfig);
  }

  let hasSpaceAvailable = await FreeUpSpace(boxConfig);

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