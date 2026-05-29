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

        /* ---------- Stat count-up ---------- */
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var statNums = document.querySelectorAll('.stat__num');
        if (statNums.length && 'IntersectionObserver' in window && !reduceMotion) {
            var countUp = function (el) {
                var raw = el.textContent.trim();
                var match = raw.match(/^(\d+)(\D*)$/); // numeric stats only (e.g. "12+", "9", "1")
                if (!match) { return; }
                var target = parseInt(match[1], 10);
                var suffix = match[2] || '';
                var dur = 1100, start = null;
                var step = function (ts) {
                    if (!start) { start = ts; }
                    var p = Math.min((ts - start) / dur, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (p < 1) { requestAnimationFrame(step); }
                };
                requestAnimationFrame(step);
            };
            var statObs = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { countUp(entry.target); obs.unobserve(entry.target); }
                });
            }, { threshold: 0.6 });
            statNums.forEach(function (el) { statObs.observe(el); });
        }

        /* ---------- Booking Assistant ----------
           All messages are built with createElement/textContent — user input
           is never parsed as HTML, so the flow is XSS-safe by construction. */
        var fab = document.getElementById('chatFab');
        var panel = document.getElementById('chat');
        var log = document.getElementById('chatLog');
        var inputArea = document.getElementById('chatInputArea');
        var closeBtn = document.getElementById('chatClose');
        var SALON_SMS = '+12392572243';

        if (fab && panel && log && inputArea) {
            var SERVICES = [
                'Hair Color', 'Balayage & Ombré', 'Highlights & Lowlights',
                'Corrective Color', 'Cut & Style', 'Brazilian Blowout',
                'Treatment / Perm', 'Bridal & Updo', 'Facial Waxing',
                'Not sure — need a consultation'
            ];
            var booking = { service: '', when: '', name: '', contact: '' };
            var started = false;

            function scrollLog() { log.scrollTop = log.scrollHeight; }

            // Append a message bubble. `content` is a string (plain text) or
            // an array of DOM nodes/strings for lightly formatted bot messages.
            function addMessage(content, who) {
                var el = document.createElement('div');
                el.className = 'msg msg--' + who;
                appendContent(el, content);
                log.appendChild(el);
                scrollLog();
                return el;
            }

            function appendContent(el, content) {
                if (typeof content === 'string') {
                    el.textContent = content;
                } else {
                    content.forEach(function (part) {
                        el.appendChild(typeof part === 'string' ? document.createTextNode(part) : part);
                    });
                }
            }

            function strong(text) {
                var b = document.createElement('b');
                b.textContent = text;
                return b;
            }
            function br() { return document.createElement('br'); }

            // Bot "types" before each message for a human feel
            function botSay(content, after) {
                var typing = document.createElement('div');
                typing.className = 'msg--typing';
                for (var i = 0; i < 3; i++) { typing.appendChild(document.createElement('span')); }
                log.appendChild(typing);
                scrollLog();
                var len = typeof content === 'string' ? content.length : 40;
                setTimeout(function () {
                    typing.remove();
                    addMessage(content, 'bot');
                    if (after) { after(); }
                }, Math.min(900, 350 + len * 9));
            }

            function clearInput() { while (inputArea.firstChild) { inputArea.removeChild(inputArea.firstChild); } }

            function showChips(options, onPick) {
                clearInput();
                var wrap = document.createElement('div');
                wrap.className = 'chat-chips';
                options.forEach(function (opt) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'chat-chip';
                    b.textContent = opt;
                    b.addEventListener('click', function () {
                        addMessage(opt, 'user');
                        onPick(opt);
                    });
                    wrap.appendChild(b);
                });
                inputArea.appendChild(wrap);
                scrollLog();
            }

            function showTextInput(placeholder, onSend) {
                clearInput();
                var f = document.createElement('form');
                f.className = 'chat-form';
                var input = document.createElement('input');
                input.type = 'text';
                input.placeholder = placeholder;
                input.setAttribute('aria-label', placeholder);
                var send = document.createElement('button');
                send.type = 'submit';
                send.className = 'chat-send';
                send.textContent = 'Send';
                f.appendChild(input);
                f.appendChild(send);
                f.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var val = input.value.trim();
                    if (!val) { return; }
                    addMessage(val, 'user');
                    onSend(val);
                });
                inputArea.appendChild(f);
                input.focus();
            }

            // --- Conversation flow ---
            function askService() {
                botSay("Hi! 👋 I'm the booking assistant for The Hair Color Experts. What can we book you in for?", function () {
                    showChips(SERVICES, function (svc) {
                        booking.service = svc;
                        askWhen();
                    });
                });
            }

            function askWhen() {
                botSay("Lovely choice. What day and time work best for you?", function () {
                    showChips(['This week', 'Next week', 'Weekend', "I'll type a date"], function (pick) {
                        if (pick === "I'll type a date") {
                            botSay("Go ahead — when suits you?", function () {
                                showTextInput('e.g. Friday afternoon, or May 14', function (val) {
                                    booking.when = val; askName();
                                });
                            });
                        } else {
                            booking.when = pick;
                            askName();
                        }
                    });
                });
            }

            function askName() {
                botSay("Perfect. And what name should I put the request under?", function () {
                    showTextInput('Your name', function (val) {
                        booking.name = val;
                        askContact();
                    });
                });
            }

            function askContact() {
                var first = booking.name.split(' ')[0];
                botSay("Thanks, " + first + "! What's the best phone number or email to confirm your appointment?", function () {
                    showTextInput('Phone or email', function (val) {
                        booking.contact = val;
                        showSummary();
                    });
                });
            }

            function showSummary() {
                var box = document.createElement('div');
                box.className = 'chat-summary';
                appendContent(box, [
                    "Here's your request:", br(),
                    '💇 ', strong('Service: '), booking.service, br(),
                    '📅 ', strong('When: '), booking.when, br(),
                    '🙋 ', strong('Name: '), booking.name, br(),
                    '📞 ', strong('Contact: '), booking.contact
                ]);
                botSay([box], function () {
                    botSay("Send it over and the salon will reach out to confirm. How would you like to send it?", function () {
                        showActions();
                    });
                });
            }

            function showActions() {
                clearInput();
                var wrap = document.createElement('div');
                wrap.className = 'chat-actions';

                var body = 'Booking request — ' + booking.service +
                    '. Preferred: ' + booking.when +
                    '. Name: ' + booking.name +
                    '. Contact: ' + booking.contact + '.';
                var sms = document.createElement('a');
                sms.className = 'chat-action chat-action--primary';
                sms.href = 'sms:' + SALON_SMS + '&body=' + encodeURIComponent(body);
                sms.textContent = '💬 Text the salon now';

                var fill = document.createElement('button');
                fill.type = 'button';
                fill.className = 'chat-action chat-action--ghost';
                fill.textContent = '📝 Fill the booking form for me';
                fill.addEventListener('click', prefillForm);

                wrap.appendChild(sms);
                wrap.appendChild(fill);
                inputArea.appendChild(wrap);
                scrollLog();
            }

            function prefillForm() {
                var f = document.getElementById('bookingForm');
                if (!f) { return; }
                f.querySelector('#name').value = booking.name;
                if (booking.contact.indexOf('@') > -1) {
                    f.querySelector('#email').value = booking.contact;
                } else {
                    f.querySelector('#phone').value = booking.contact;
                }
                var sel = f.querySelector('#service');
                var target = booking.service.replace(/\s+/g, ' ').trim();
                Array.prototype.forEach.call(sel.options, function (o) {
                    if (o.text.replace(/\s+/g, ' ').trim() === target) {
                        sel.value = o.value || o.text;
                    }
                });
                f.querySelector('#message').value = 'Preferred time: ' + booking.when;
                botSay(["Done! I've filled in the booking form for you — just scroll down and hit ", strong('Send Request'), '. 🎉']);
                setTimeout(function () {
                    toggleChat(false);
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                    f.querySelector('#name').focus();
                }, 1400);
            }

            function toggleChat(open) {
                panel.hidden = !open;
                fab.classList.toggle('is-open', open);
                fab.setAttribute('aria-expanded', String(open));
                if (open && !started) {
                    started = true;
                    askService();
                }
            }

            fab.addEventListener('click', function () { toggleChat(panel.hidden); });
            if (closeBtn) { closeBtn.addEventListener('click', function () { toggleChat(false); }); }
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && !panel.hidden) { toggleChat(false); }
            });
        }
    });
})();
