window.addEventListener('DOMContentLoaded', () => {
  const [player, input] = initPlayer();
  loadVideo(input.value);

  function initPlayer() {
    const input = document.getElementById('url-input');
    const options = { controls: true, autoplay: false, preload: 'auto' };

    input.addEventListener('keyup', onInput);
    input.value = 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/arriadia/hls_snrt/arriadia-avc1_1500000=4-mp4a_130400_qad=1.m3u8';

    const player = videojs('player', options);
    return [player, input];
  }

  function loadVideo(url) {
    player.src({ src: url, type: 'application/x-mpegURL' });
    player.play();
  }

  function onInput(e) {
    const url = e.target.value.trim();

    if (isValidUrl(url)) {
      loadVideo(url);
    }
  }

  function isValidUrl(url) {
    try {
      return Boolean(new URL(url));
    }

    catch (e) {
      return false;
    }
  }
});