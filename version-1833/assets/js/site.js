(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!expanded));
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var filterInput = document.querySelector(".filter-input");
        var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var counter = document.querySelector(".result-count");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var query = normalize(filterInput ? filterInput.value : "");
            var filters = {};

            filterSelects.forEach(function (select) {
                filters[select.getAttribute("data-filter")] = normalize(select.value);
            });

            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchQuery = !query || haystack.indexOf(query) >= 0;
                var matchYear = !filters.year || normalize(card.getAttribute("data-year")) === filters.year;
                var matchType = !filters.type || normalize(card.getAttribute("data-type")) === filters.type;
                var isVisible = matchQuery && matchYear && matchType;
                card.classList.toggle("is-hidden", !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = "显示 " + visible + " 部";
            }
        }

        if (filterInput || filterSelects.length) {
            if (filterInput) {
                filterInput.addEventListener("input", applyFilters);
            }
            filterSelects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            applyFilters();
        }

        var searchInput = document.getElementById("global-search-input");
        var searchResults = document.getElementById("global-search-results");

        if (searchInput && searchResults && window.MovieSearchIndex) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            searchInput.value = initialQuery;

            function escapeHtml(value) {
                return String(value || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }

            function renderSearch() {
                var query = normalize(searchInput.value);
                var items = window.MovieSearchIndex.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.region,
                        movie.year,
                        movie.type,
                        movie.genre,
                        movie.tags,
                        movie.oneLine
                    ].join(" "));
                    return !query || haystack.indexOf(query) >= 0;
                }).slice(0, 80);

                if (!items.length) {
                    searchResults.innerHTML = "<div class=\"content-card\"><h2>未找到匹配影片</h2><p>可尝试输入片名、年份、地区或题材标签。</p></div>";
                    return;
                }

                searchResults.innerHTML = items.map(function (movie) {
                    return "<a class=\"search-result-card\" href=\"" + escapeHtml(movie.url) + "\">" +
                        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                        "<div><h2>" + escapeHtml(movie.title) + "</h2><p>" + escapeHtml(movie.oneLine) + "</p></div>" +
                        "<span>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</span>" +
                        "</a>";
                }).join("");
            }

            searchInput.addEventListener("input", renderSearch);
            renderSearch();
        }
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function startPlayback() {
        attachStream();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
