const user = {
    token: null
};
function isLoggedIn() {
    return !!user.token;
}

export {user, isLoggedIn};