import {server as serverConfig} from "../config.js";
import urlJoin from "url-join";
import axios from "axios";
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';

function api(endpoint, params, {showError = true} = {}) {
    console.log(showError);
    axios.post(urlJoin(serverConfig.url, endpoint), params)
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            if (showError && error.response.data.errMsg) {
                console.dir(error);
                swal('出错了', error.response.data.errMsg, 'error');
            }
        });
}

export {api};