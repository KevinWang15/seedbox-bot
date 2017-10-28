enum ClientType{
    qBittorrent,
    Transmission,
    ruTorrent
}

function getClientTypeName(clientType) {
    return [
        "qBittorrent",
        "Transmission",
        "ruTorrent"
    ][clientType];
}

export {ClientType, getClientTypeName};
