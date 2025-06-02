const axios = require("axios");

const API_URL = "http://tv.m3uts.xyz/player_api.php?username=m&password=m&action=get_live_streams";
const HEADERS = {
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; 21061119AL Build/RP1A.200720.011)"
};

let canales_cache = null;
let last_cache_update = 0;
const CACHE_TIMEOUT = 3600000;

async function obtenerListaCanales() {
  if (canales_cache && (Date.now() - last_cache_update) < CACHE_TIMEOUT) {
    return canales_cache;
  }

  try {
    const response = await axios.get(API_URL, { headers: HEADERS });
    canales_cache = response.data;
    last_cache_update = Date.now();
    return canales_cache;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  const canales = await obtenerListaCanales();
  if (!canales) {
    res.setHeader("Content-Type", "audio/x-mpegurl");
    return res.end("#EXTM3U\n# ERROR: No se pudo obtener la lista de canales");
  }

  const baseUrl = `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;
  let m3uContent = ["#EXTM3U\n"];

  canales.forEach((canal) => {
    const streamUrl = `${baseUrl}/api/stream?streamId=${canal.stream_id}`;
    m3uContent.push(`#EXTINF:-1 tvg-logo="${canal.stream_icon}" group-title="Live", ${canal.name}`);
    m3uContent.push(streamUrl);
  });

  res.setHeader("Content-Type", "audio/x-mpegurl");
  res.end(m3uContent.join("\n"));
};
