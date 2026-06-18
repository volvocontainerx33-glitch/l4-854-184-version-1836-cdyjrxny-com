(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-cover]');
    var button = shell.querySelector('[data-play-button]');
    if (!video) return;
    var stream = video.getAttribute('data-stream') || '';
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (ready || !stream) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      if (cover) cover.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (cover) cover.classList.remove('is-hidden');
        });
      }
    }

    if (cover) cover.addEventListener('click', play);
    if (button) button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
