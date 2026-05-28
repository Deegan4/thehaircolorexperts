/* The Hair Color Experts — interactions */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        /* ----- Current year in footer ----- */
        var yearEl = document.getElementById('year');
        if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

        /* ----- Mobile nav toggle ----- */
        var navToggle = document.getElementById('navToggle');
        var nav = document.getElementById('nav');

        function closeNav() {
            if (!nav) { return; }
            nav.classList.remove('is-open');
            navToggle.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        if (navToggle && nav) {
            navToggle.addEventListener('click', function () {
                var open = nav.classList.toggle('is-open');
                navToggle.classList.toggle('is-open', open);
                navToggle.setAttribute('aria-expanded', String(open));
            });
            nav.addEventListener('click', function (e) {
                if (e.target.closest('a')) { closeNav(); }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { closeNav(); }
            });
        }

        /* ----- Header shadow + back-to-top visibility on scroll ----- */
        var header = document.getElementById('header');
        var toTop = document.getElementById('toTop');

        function onScroll() {
            var y = window.pageYOffset || document.documentElement.scrollTop;
            if (header) { header.classList.toggle('is-scrolled', y > 10); }
            if (toTop) { toTop.classList.toggle('is-visible', y > 600); }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* ----- Scroll-reveal animations ----- */
        var revealEls = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && revealEls.length) {
            var io = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(function (el) { io.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        }

        /* ----- Active nav link based on section in view ----- */
        var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
        var sections = navLinks
            .map(function (link) {
                var id = link.getAttribute('href');
                return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
            })
            .filter(Boolean);

        if ('IntersectionObserver' in window && sections.length) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = '#' + entry.target.id;
                        navLinks.forEach(function (link) {
                            link.classList.toggle('is-active', link.getAttribute('href') === id);
                        });
                    }
                });
            }, { threshold: 0.5 });
            sections.forEach(function (sec) { spy.observe(sec); });
        }

        /* ----- Booking form (front-end validation + friendly feedback) ----- */
        var form = document.getElementById('bookingForm');
        var status = document.getElementById('formStatus');

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                status.className = 'form-status';
                status.textContent = '';

                var required = form.querySelectorAll('[required]');
                var valid = true;

                required.forEach(function (field) {
                    var ok = field.value.trim() !== '';
                    if (ok && field.type === 'email') { ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value); }
                    field.classList.toggle('is-invalid', !ok);
                    if (!ok) { valid = false; }
                });

                var emailField = form.querySelector('#email');
                if (emailField && emailField.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
                    emailField.classList.add('is-invalid');
                    valid = false;
                }

                if (!valid) {
                    status.classList.add('is-error');
                    status.textContent = 'Please fill in the highlighted fields.';
                    return;
                }

                var name = form.querySelector('#name').value.trim().split(' ')[0];
                status.classList.add('is-success');
                status.textContent = 'Thank you' + (name ? ', ' + name : '') + '! We’ll reach out shortly to confirm your appointment.';
                form.reset();
            });

            form.querySelectorAll('input, select, textarea').forEach(function (field) {
                field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
            });
        }
    });
})();
