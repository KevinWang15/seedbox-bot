import {server as serverConfig} from "../config.js";
import urlJoin from "url-join";
import axios from "axios";

function api(endpoint, params, {showError = false} = {}) {
    console.log(showError);
    axios.post(urlJoin(serverConfig.url, endpoint), params)
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

export {api};