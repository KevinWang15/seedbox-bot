enum ClientType{
    qBittorrent,
    Transmission,
    // ruTorrent
}

function getClientTypeName(clientType) {
    return [
        "qBittorrent",
        "Transmission",
        // "ruTorrent"
    ][clientType];
}

function getClientTypeIcon(clientType) {
    return [
        "/icons/qbittorrent.ico",
        "/icons/transmission.ico",
        // "ruTorrent"
    ][clientType];
}

export {ClientType, getClientTypeName, getClientTypeIcon};
