enum ClientType{
    qBittorrent,
    Transmission,
    ruTorrent,
    Deluge,
    // uTorrent,
}

function getClientTypeName(clientType) {
    return [
        "qBittorrent",
        "Transmission",
        "ruTorrent",
        "Deluge",
        // "uTorrent",
    ][clientType];
}

function getClientTypeIcon(clientType) {
    return [
        "/icons/qbittorrent.ico",
        "/icons/transmission.ico",
        "/icons/rutorrent.png",
        "/icons/deluge.png",
        // "/icons/utorrent.png",
    ][clientType];
}

export {ClientType, getClientTypeName, getClientTypeIcon};
