import {server as serverConfig} from "../config.js";
import {user} from "../mem/user";
import urlJoin from "url-join";
import axios from "axios";
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';

function api(endpoint, params, {showError = true} = {}) {
    let url = urlJoin(serverConfig.url, endpoint);
    if (process.env.NODE_ENV === 'production') {
        url = endpoint;
    }
    return axios.post(url, params,
        {
            headers: {
                token: user.token
            }
        })
        .then(_ => {
            return _.data;
        })
        .catch(function (error) {
            if (showError && error && error.response && error.response.data && error.response.data.errMsg) {
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

function editBox(data) {
    return api('user/edit-box', data);
}

function getRssTorrentsList(rssFeedId) {
    return api('user/get-rss-torrents-list', {rss_feed_id: rssFeedId});
}

function getCoreSettings() {
    return api('user/get-core-settings', {});
}

function saveCoreSettings(settings) {
    return api('user/save-core-settings', {settings});
}

export {
    api,
    getBoxList,
    deleteBox,
    createBox,
    editBox,
    getRssTorrentsList,
    getCoreSettings,
    saveCoreSettings
};