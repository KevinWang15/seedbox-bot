import {user} from "../mem/user";
import {api} from "./ApiService";
import {appRoot} from "../App";
import swal from 'sweetalert2/dist/sweetalert2.all.min.js';

function isLoggedIn() {
    return !!user.token;
}

async function login(username, password) {
    api("auth/login", {
        username,
        password
    }).then(data => {
        user.token = data.token;
        localStorage['token'] = data.token;
        swal({title: '登入成功', type: 'success'});
        appRoot.ref.forceUpdate();
    });
}

export {login, isLoggedIn};