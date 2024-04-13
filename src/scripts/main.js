window.addEventListener('DOMContentLoaded', () => {
  const url = "https://amchls.wns.live/hls/stream.m3u8";
  const video = document.getElementById('player');
  const source = document.createElement('source');

  source.src = url;
  source.type = "application/x-mpegURL";

  video.appendChild(source);
  videojs('player', options);
});