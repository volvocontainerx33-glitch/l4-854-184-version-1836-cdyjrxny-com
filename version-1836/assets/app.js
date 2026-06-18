(function() {
  var toggles = document.querySelectorAll('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  toggles.forEach(function(button) {
    button.addEventListener('click', function() {
      if (menu) {
        menu.classList.toggle('is-open');
      }
    });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var empty = scope.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      var query = valueOf(input);
      var yearValue = valueOf(year);
      var typeValue = valueOf(type);
      var visible = 0;

      cards.forEach(function(card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var matched = true;

        if (query && search.indexOf(query) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function(element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  });
})();
