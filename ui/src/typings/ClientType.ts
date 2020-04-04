enum ClientType{
    qBittorrent,
    Transmission,
    ruTorrent,
    Deluge,
    uTorrent,
    qBittorrent42,
}

function getClientTypeName(clientType) {
    return [
        "qBittorrent",
        "Transmission",
        "ruTorrent",
        "Deluge",
        "uTorrent",
        "qBittorrent 4.2+",
    ][clientType];
}

function getClientTypeIcon(clientType) {
    return [
        "/icons/qbittorrent.ico",
        "/icons/transmission.ico",
        "/icons/rutorrent.png",
        "/icons/deluge.png",
        "/icons/utorrent.png",
        "/icons/qbittorrent.ico",
    ][clientType];
}

function getClientTypeUrlSample(clientType) {
    return [
        "http://111.222.111.222:8080/",
        "http://111.222.111.222:9091/transmission/",
        "http://111.222.111.222/rutorrent/",
        "http://111.222.111.222:8112/",
        "http://111.222.111.222:8080/gui/",
        "http://111.222.111.222:8080/",
    ][clientType];
}

export {ClientType, getClientTypeName, getClientTypeIcon, getClientTypeUrlSample};
