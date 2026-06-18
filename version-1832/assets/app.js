(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot"));
                if (!Number.isNaN(next)) {
                    show(next);
                    start();
                }
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupFiltering() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector(".content-filter-input") || document.querySelector("#page-search");
        var empty = document.querySelector(".empty-result");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
        var activeType = "all";

        function apply() {
            var query = normalize(input ? input.value : "");
            var shown = 0;
            lists.forEach(function (list) {
                var items = Array.prototype.slice.call(list.querySelectorAll("[data-search-item]"));
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-tags"),
                        item.getAttribute("data-genre"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-year"),
                        item.getAttribute("data-kind")
                    ].join(" "));
                    var kind = item.getAttribute("data-kind") || "";
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = activeType === "all" || kind === activeType;
                    var visible = matchQuery && matchType;
                    item.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");
            if (initial) {
                input.value = initial;
            }
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeType = chip.getAttribute("data-type-filter") || "all";
                chips.forEach(function (other) {
                    other.classList.toggle("is-active", other === chip);
                });
                apply();
            });
        });

        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var hls = null;

            function load() {
                if (!stream || video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute("data-ready", "1");
            }

            function start() {
                load();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
