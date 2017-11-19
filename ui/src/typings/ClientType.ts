enum ClientType{
    qBittorrent,
    Transmission,
    ruTorrent,
    Deluge,
    uTorrent,
}

function getClientTypeName(clientType) {
    return [
        "qBittorrent",
        "Transmission",
        "ruTorrent",
        "Deluge",
        "uTorrent",
    ][clientType];
}

function getClientTypeIcon(clientType) {
    return [
        "/icons/qbittorrent.ico",
        "/icons/transmission.ico",
        "/icons/rutorrent.png",
        "/icons/deluge.png",
        "/icons/utorrent.png",
    ][clientType];
}

function getClientTypeUrlSample(clientType) {
    return [
        "http://111.222.111.222:8080/",
        "http://111.222.111.222:9091/transmission/",
        "http://111.222.111.222/rutorrent/",
        "http://111.222.111.222:8112/",
        "http://111.222.111.222:8080/gui/",
    ][clientType];
}

export {ClientType, getClientTypeName, getClientTypeIcon, getClientTypeUrlSample};
