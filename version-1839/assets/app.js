document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const start = () => {
      timer = window.setInterval(() => showSlide(active + 1), 5600);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        window.clearInterval(timer);
        showSlide(Number(dot.dataset.heroDot));
        start();
      });
    });

    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const type = scope.querySelector('[data-filter-type]');
    const region = scope.querySelector('[data-filter-region]');
    const year = scope.querySelector('[data-filter-year]');
    const empty = scope.querySelector('[data-filter-empty]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const apply = () => {
      const query = normalize(input ? input.value : '');
      const typeValue = normalize(type ? type.value : '');
      const regionValue = normalize(region ? region.value : '');
      const yearValue = normalize(year ? year.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        const matchesQuery = !query || haystack.includes(query);
        const matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
        const matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        const show = matchesQuery && matchesType && matchesRegion && matchesYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, type, region, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
});
