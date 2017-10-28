import {user} from "../mem/user";
import {api} from "./ApiService";
import {appRoot} from "../App";
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';

if (localStorage['token']) {
    info().catch(_ => {
        swal({title: '登入信息失效，请重新登入', type: 'error'});
        user.token = null;
        localStorage['token'] = null;
        appRoot.ref.forceUpdate();
    });
}

function isLoggedIn() {
    return !!user.token;
}

async function login(username, password) {
    return api("auth/login", {
        username,
        password
    }).then(data => {
        user.token = data.token;
        localStorage['token'] = data.token;
        swal({title: '登入成功', type: 'success'});
        appRoot.ref.forceUpdate();
    });
}

async function info() {
    return api("user/info", {}, {showError: false});
}

export {login, isLoggedIn};