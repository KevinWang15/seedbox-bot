import qBittorrentClient from "./qBittorrent";
const ClientTypes = {
  qBittorrent: 0,
  Transmission: 1,
  ruTorrent: 2,
};

function createClient(boxConfig) {
  switch (boxConfig.client_type) {
    case ClientTypes.qBittorrent:
      return new qBittorrentClient(boxConfig);
      break;
    default:
      return new qBittorrentClient(boxConfig);
      break;
    // case ClientTypes.Transmission:
    //   return new Transmission(boxConfig);
    //   break;
    // case ClientTypes.ruTorrent:
    //   return new ruTorrent(boxConfig);
    //   break;
  }
}

export { createClient, ClientTypes };