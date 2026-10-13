/* ===== Glamping Tunja — comportamiento ===== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Carruseles ---------- */
    function initCarousel(root) {
        var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
        if (slides.length < 2) return;

        var dotsBox = root.querySelector('.dots');
        var prevBtn = root.querySelector('.prev');
        var nextBtn = root.querySelector('.next');
        var delay = parseInt(root.getAttribute('data-autoplay'), 10) || 0;
        var current = 0;
        var timer = null;
        var dots = [];

        if (dotsBox) {
            slides.forEach(function (_, i) {
                var d = document.createElement('button');
                d.type = 'button';
                d.className = 'dot' + (i === 0 ? ' is-active' : '');
                d.setAttribute('aria-label', 'Ir a la foto ' + (i + 1));
                d.addEventListener('click', function () { goTo(i, true); });
                dotsBox.appendChild(d);
                dots.push(d);
            });
        }

        function goTo(n, userAction) {
            slides[current].classList.remove('is-active');
            if (dots[current]) dots[current].classList.remove('is-active');
            current = (n + slides.length) % slides.length;
            slides[current].classList.add('is-active');
            if (dots[current]) dots[current].classList.add('is-active');
            if (userAction) restart();
        }

        function start() {
            if (!delay || reduceMotion || timer) return;
            timer = setInterval(function () { goTo(current + 1); }, delay);
        }
        function stop() { clearInterval(timer); timer = null; }
        function restart() { stop(); start(); }

        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, true); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, true); });

        // Pausa al pasar el mouse o enfocar
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        root.addEventListener('focusin', stop);
        root.addEventListener('focusout', start);

        // Deslizar con el dedo
        var startX = null;
        root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        root.addEventListener('touchend', function (e) {
            if (startX === null) return;
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1), true);
            startX = null;
        }, { passive: true });

        // Solo corre cuando está visible en pantalla y la pestaña está activa
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries[0].isIntersecting ? start() : stop();
            }, { threshold: 0.25 }).observe(root);
        } else {
            start();
        }
        document.addEventListener('visibilitychange', function () {
            document.hidden ? stop() : start();
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(initCarousel);

    /* ---------- Menú: fondo al hacer scroll ---------- */
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Aparición al hacer scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Lightbox de la galería ---------- */
    var box = document.getElementById('lightbox');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox] .tile'));
    var lbImg = box.querySelector('img');
    var idx = 0;

    function show(i) {
        idx = (i + tiles.length) % tiles.length;
        var img = tiles[idx].querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
    }
    function open(i) { show(i); box.hidden = false; document.body.style.overflow = 'hidden'; }
    function close() { box.hidden = true; document.body.style.overflow = ''; }

    tiles.forEach(function (t, i) { t.addEventListener('click', function () { open(i); }); });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
    });

    /* ---------- Año del copyright ---------- */
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
})();
