(function() {
  var video = document.getElementById('movie-player');
  if (!video) {
    return;
  }

  var startButton = document.querySelector('[data-play-button]');
  var playlist = video.getAttribute('data-stream') || '';
  var ready = false;

  function bindSource() {
    if (!playlist || ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlist;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(playlist);
      hls.attachMedia(video);
      video.__hls = hls;
      ready = true;
      return;
    }

    video.src = playlist;
    ready = true;
  }

  function hideStartButton() {
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
  }

  function playVideo(event) {
    if (event) {
      event.preventDefault();
    }

    bindSource();
    hideStartButton();
    video.controls = true;

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', hideStartButton);
})();
