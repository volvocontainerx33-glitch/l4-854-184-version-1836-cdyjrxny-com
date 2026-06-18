(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-video');
        var overlay = document.getElementById('player-overlay');
        var shell = document.getElementById('movie-player');
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function play() {
            attachSource();
            hideOverlay();
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === shell) {
                    play();
                }
            });
        }
        video.addEventListener('play', hideOverlay);
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
