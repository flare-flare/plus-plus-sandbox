const express = require('express');
const request = require('request');

const PORT = 3001;
const app = express();

app.use('/stream', (_, res) => {
  const url = 'https://amchls.wns.live/hls/stream.m3u8';
  request({ url: url, headers: { 'User-Agent': 'node.js' } })
    .pipe(res);
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));