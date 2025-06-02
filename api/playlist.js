const axios = require("axios");

const HEADERS = {
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 11; 21061119AL Build/RP1A.200720.011)",
  "Content-Type": "application/x-www-form-urlencoded"
};

module.exports = async (req, res) => {
  const streamId = req.query.streamId;
  const url = `http://tv.m3uts.xyz/stream/gen/${streamId}`;
  const data = new URLSearchParams({
    id: streamId,
    cast: "false",
    device: "76772c3f06226446",
    code: "200"
  });

  try {
    const response = await axios.post(url, data, { headers: HEADERS });
    const text = response.data;
    const m3u8Match = text.match(/http:\/\/[^\s]+\.m3u8/);

    if (m3u8Match) {
      res.writeHead(302, { Location: m3u8Match[0] });
      return res.end();
    }

    res.status(404).end("#EXTM3U\n# ERROR: No se pudo obtener el stream");
  } catch {
    res.status(500).end("#EXTM3U\n# ERROR: Falló la petición");
  }
};
