import {server as serverConfig} from "../config.js";
import {user} from "../mem/user";
import urlJoin from "url-join";
import axios from "axios";
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';

function api(endpoint, params, {showError = true} = {}) {
    return axios.post(urlJoin(serverConfig.url, endpoint), params,
        {
            headers: {
                token: user.token
            }
        })
        .then(_ => {
            return _.data;
        })
        .catch(function (error) {
            if (showError && error.response.data.errMsg) {
                swal('出错了', error.response.data.errMsg, 'error');
            }
            throw error;
        });
}

function getBoxList() {
    return api('user/box-list', {});
}

function deleteBox(id) {
    return api('user/delete-box', {id});
}

function createBox() {
    return api('user/create-box', {});
}

export {api, getBoxList, deleteBox, createBox};