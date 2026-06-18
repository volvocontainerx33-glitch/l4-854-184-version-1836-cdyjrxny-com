(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var button = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
        searchInputs.forEach(function (input) {
            var scope = input.closest('.site-container');
            if (!scope || !scope.querySelector('.movie-card')) {
                scope = document;
            }
            var yearFilter = document.querySelector('[data-year-filter]');
            var typeFilter = document.querySelector('[data-type-filter]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
            var empty = document.querySelector('.empty-state');
            function apply() {
                var term = normalize(input.value);
                var year = yearFilter ? normalize(yearFilter.value) : '';
                var type = typeFilter ? normalize(typeFilter.value) : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchTerm = !term || haystack.indexOf(term) !== -1;
                    var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                    var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                    var matched = matchTerm && matchYear && matchType;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            input.addEventListener('input', apply);
            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }
            if (typeFilter) {
                typeFilter.addEventListener('change', apply);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
