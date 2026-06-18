(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function applyFilter(root, query, category) {
    var q = normalize(query);
    var cat = category || "all";
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-search-item]"));
    items.forEach(function (item) {
      var text = normalize(item.getAttribute("data-search"));
      var itemCat = item.getAttribute("data-category") || "";
      var matchedText = !q || text.indexOf(q) !== -1;
      var matchedCat = cat === "all" || itemCat === cat;
      item.classList.toggle("hidden", !(matchedText && matchedCat));
    });
  }

  function initLocalFilter() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    forms.forEach(function (form) {
      var container = document.querySelector("[data-filter-list]");
      var input = form.querySelector("input");
      if (!container || !input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter(container, input.value, "all");
      });
      input.addEventListener("input", function () {
        applyFilter(container, input.value, "all");
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var container = page.querySelector("[data-filter-list]");
    var form = page.querySelector("[data-search-filter]");
    var input = form ? form.querySelector("input") : null;
    var chips = Array.prototype.slice.call(page.querySelectorAll("[data-category-filter]"));
    var params = new URLSearchParams(window.location.search);
    var currentCategory = "all";

    if (input) {
      input.value = params.get("q") || "";
    }

    function run() {
      applyFilter(container, input ? input.value : "", currentCategory);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        run();
      });
    }

    if (input) {
      input.addEventListener("input", run);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        currentCategory = chip.getAttribute("data-category-filter") || "all";
        chips.forEach(function (other) {
          other.classList.toggle("active", other === chip);
        });
        run();
      });
    });

    run();
  }

  function initPlayer() {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play-button]");
    var source = box.getAttribute("data-hls");
    var started = false;
    var hls = null;

    function attach() {
      if (started || !video || !source) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      box.classList.add("is-playing");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
