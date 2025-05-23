import axios from "axios";
import logger from "./logger.ts";
export class QBittorrentClient {
  constructor(private baseUrl: string) {}

  async isAllTorrentsCompleted(): Promise<boolean> {
    const url = `${this.baseUrl}/api/v2/torrents/info?filter=downloading`;
    const response = await axios.get<unknown[]>(url);
    const torrents = response.data;
    return Array.isArray(torrents) && torrents.length === 0;
  }

  async deleteAllCompletedTorrentsFromList(): Promise<void> {
    const url = `${this.baseUrl}/api/v2/torrents/delete`;
    const postData = "hashes=all&deleteFiles=false";
    await axios.post(url, postData);
    logger.info("Cleared all downloaded torrents from client");
  }
}
