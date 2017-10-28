import qBittorrentClient from "./qBittorrent";
import TransmissionClient from "./transmission";
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
    case ClientTypes.Transmission:
      return new TransmissionClient(boxConfig);
      break;
    // case ClientTypes.ruTorrent:
    //   return new ruTorrent(boxConfig);
    //   break;
    default:
      return new qBittorrentClient(boxConfig);
      break;
  }
}

export { createClient, ClientTypes };