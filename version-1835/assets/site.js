(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setupSearchPage() {
        var container = document.getElementById("searchResults");
        if (!container || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var title = document.querySelector("[data-search-title]");
        var empty = document.querySelector("[data-empty-state]");
        var input = document.querySelector(".wide-search input[name='q']");
        if (input) {
            input.value = query;
        }
        if (title) {
            title.textContent = query ? "搜索：“" + query + "”" : "推荐浏览";
        }
        var source = window.MOVIE_SEARCH_INDEX;
        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = source.filter(function (movie) {
            if (!words.length) {
                return movie.featured;
            }
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.tags,
                movie.oneLine
            ].join(" ").toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 240);
        container.innerHTML = results.map(renderSearchCard).join("");
        if (empty) {
            empty.hidden = results.length !== 0;
        }
        setupImageFallbacks();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || "").split(",").filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-wrap\" href=\"movies/" + movie.file + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
            "<img class=\"poster-img\" src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span>",
            "<span class=\"poster-play\">播放</span>",
            "</a>",
            "<div class=\"movie-info\">",
            "<h3><a href=\"movies/" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + "</p>",
            "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve();
        }
        if (window.__hlsScriptPromise) {
            return window.__hlsScriptPromise;
        }
        window.__hlsScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsScriptPromise;
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var source = player.getAttribute("data-src");
        var initialized = false;
        var hlsInstance = null;

        function attachSource() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            return loadHlsScript().then(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = source;
            }).catch(function () {
                video.src = source;
            });
        }

        function startPlayback() {
            attachSource().then(function () {
                video.controls = true;
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupImageFallbacks();
        setupHero();
        setupSearchPage();
        setupPlayer();
    });
}());
