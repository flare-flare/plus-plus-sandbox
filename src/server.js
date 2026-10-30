const express = require('express');
const { Readable, pipeline } = require('node:stream');

const PORT = 3001;
const STREAM_URL = 'https://amchls.wns.live/hls/stream.m3u8';

const app = express();

app.use('/stream', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  // Serve the playlist from under `/stream/` so its relative segment URLs go through the proxy too.
  if (req.path === '/') {
    return res.redirect(`${req.baseUrl}/${STREAM_URL.split('/').pop()}`);
  }

  try {
    const upstream = await fetch(new URL(`.${req.url}`, STREAM_URL), { headers: { 'User-Agent': 'node.js' } });
    const type = upstream.headers.get('content-type');

    res.status(upstream.status);
    if (type) res.set('Content-Type', type);
    if (!upstream.body) return res.end();

    pipeline(Readable.fromWeb(upstream.body), res, () => {});
  }

  catch (error) {
    res.status(502).send(`Failed to fetch stream: ${error.cause?.message ?? error.message}`);
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
