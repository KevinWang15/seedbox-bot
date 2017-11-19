import qBittorrentClient from "./qBittorrent";
import TransmissionClient from "./transmission";
import ruTorrentClient from "./rutorrent";
import DelugeClient from "./deluge";
import uTorrentClient from "./utorrent";
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
    case ClientTypes.uTorrent:
      return new uTorrentClient(boxConfig);
      break;
    default:
      throw new Error("Invalid client type");
      break;
  }
}

export { createClient, ClientTypes };