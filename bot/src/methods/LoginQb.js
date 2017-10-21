import { httpRequest } from "../components/Http";
import { cookieJars } from "../mem/CookieJars";
import request from "request";

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

export { LoginQb };