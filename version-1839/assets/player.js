import { H as Hls } from './hls.js';

export function setupPlayer(options) {
  const video = document.querySelector(options.videoSelector);
  const cover = document.querySelector(options.coverSelector);
  const streamUrl = options.streamUrl;
  let loaded = false;
  let hls = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  const bindStream = () => {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    }

    loaded = true;
  };

  const startPlayback = async () => {
    bindStream();
    cover.classList.add('is-hidden');
    video.controls = true;
    try {
      await video.play();
    } catch (error) {
      cover.classList.remove('is-hidden');
    }
  };

  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', () => cover.classList.add('is-hidden'));
  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) {
      cover.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
