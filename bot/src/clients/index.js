import qBittorrentClient from "./qBittorrent";
import TransmissionClient from "./transmission";
import ruTorrentClient from "./rutorrent";
import DelugeClient from "./deluge";
const ClientTypes = {
  qBittorrent: 0,
  Transmission: 1,
  ruTorrent: 2,
  Deluge: 3,
  uTorrent: 4,
};

function createClient(boxConfig) {
  switch (boxConfig.client_type) {
    case ClientTypes.qBittorrent:
      return new qBittorrentClient(boxConfig);
      break;
    case ClientTypes.Transmission:
      return new TransmissionClient(boxConfig);
      break;
    case ClientTypes.ruTorrent:
      return new ruTorrentClient(boxConfig);
      break;
    case ClientTypes.Deluge:
      return new DelugeClient(boxConfig);
      break;
    default:
      return new qBittorrentClient(boxConfig);
      break;
  }
}

export { createClient, ClientTypes };