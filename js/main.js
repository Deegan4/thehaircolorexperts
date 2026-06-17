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

        /* ---------- Shop & reservation cart ----------
           PRODUCTS is the single source of truth for the storefront — edit
           names, sizes, brands, prices, and the photo each card uses right
           here. `price` may be a number (e.g. 28) or null to show "Ask in
           salon" until you set it. The shelf photos in assets/product-photos/
           show several items each; swap in individual product shots as you get
           them. Cart rows are built with createElement/textContent, so the
           reservation flow is XSS-safe by construction, like the booking chat. */
        var shopGrid = document.getElementById('shopGrid');
        var cartDrawer = document.getElementById('cart');

        if (shopGrid && cartDrawer) {
            var IMG = 'assets/product-photos/';
            var SALON_SMS_SHOP = '+12392572243';

            var PRODUCTS = [
                // milk_shake — prices are official US milkshakehair.com MSRP unless noted
                { id: 'ms-silver-shine-whip',   brand: 'milk_shake', name: 'Silver Shine Whipped Cream',          size: '200 ml',  price: 28, desc: 'Violet leave-in foam that neutralizes yellow tones in blonde & grey hair.', img: IMG + 'IMG_6622.jpeg' },
                { id: 'ms-cwc-warm-brunette',   brand: 'milk_shake', name: 'Color Whipped Cream · Warm Brunette',  size: '100 ml',  price: 28, desc: 'Temporary tone-on-tone color foam that adds warmth to brunettes.', img: IMG + 'IMG_6622.jpeg' },
                { id: 'ms-cwc-golden-blond',    brand: 'milk_shake', name: 'Color Whipped Cream · Golden Blond',   size: '100 ml',  price: 28, desc: 'Temporary color foam for a sun-kissed golden-blond glow.', img: IMG + 'IMG_6622.jpeg' },
                { id: 'ms-cwc-violet',          brand: 'milk_shake', name: 'Color Whipped Cream · Violet',         size: '100 ml',  price: 28, desc: 'Temporary violet foam that neutralizes yellow or adds a pop.', img: IMG + 'IMG_6622.jpeg' },
                { id: 'ms-colour-shampoo',      brand: 'milk_shake', name: 'Color Maintainer Shampoo',            size: '300 ml',  price: 28, desc: 'Sulfate-free shampoo that extends and protects color-treated hair.', img: IMG + 'IMG_6628.jpeg' },
                { id: 'ms-colour-conditioner',  brand: 'milk_shake', name: 'Color Maintainer Conditioner',        size: '300 ml',  price: 28, desc: 'Paraben-free conditioner that hydrates color-treated hair.', img: IMG + 'IMG_6628.jpeg' },
                { id: 'ms-sensorial-mint',      brand: 'milk_shake', name: 'Sensorial Mint Shampoo',              size: '300 ml',  price: 23, desc: 'SLS-free invigorating mint shampoo that refreshes scalp and hair.', img: IMG + 'IMG_6628.jpeg' },
                { id: 'ms-silver-shine-liter',  brand: 'milk_shake', name: 'Silver Shine Shampoo',                size: '1000 ml', price: 62, desc: 'Purple toning shampoo that neutralizes brass in blonde & grey hair.', img: IMG + 'IMG_6629.jpeg' },
                { id: 'ms-leave-in',            brand: 'milk_shake', name: 'Leave-In Conditioner',                size: '1000 ml', price: 48, desc: 'Vanilla-scented rinse-free cream for smooth, glossy hair.', img: IMG + 'IMG_6629.jpeg' },
                { id: 'ms-liquid-styler',       brand: 'milk_shake', name: 'Lifestyling Liquid Styler',           size: '200 ml',  price: 26, desc: 'Styling fluid for soft, flexible hold with memory effect.', img: IMG + 'IMG_6626.jpeg' },
                { id: 'ms-blowdry-primer',      brand: 'milk_shake', name: 'Lifestyling Blow-Dry Primer',         size: '200 ml',  price: 26, desc: 'Pre-styling lotion that adds body and protects from heat.', img: IMG + 'IMG_6626.jpeg' },
                { id: 'ms-no-frizz-milk',       brand: 'milk_shake', name: 'Glistening Milk',                     size: '125 ml',  price: 30, desc: 'Moisturizing milk that tames frizz and adds brilliant shine.', img: IMG + 'IMG_6627.jpeg' },
                // amika — prices are loveamika.com MSRP
                { id: 'am-perk-up',             brand: 'amika',      name: 'Perk Up Dry Shampoo',                 size: '5.3 oz',  price: 26, desc: 'Talc-free dry shampoo that absorbs oil and boosts volume.', img: IMG + 'IMG_6623.jpeg' },
                { id: 'am-perk-up-plus',        brand: 'amika',      name: 'Perk Up Plus Extended Clean',         size: '5.3 oz',  price: 31, desc: 'AHA-infused dry shampoo for longer-lasting clean roots.', img: IMG + 'IMG_6623.jpeg' },
                { id: 'am-flash',               brand: 'amika',      name: 'Flash Instant Shine Mask',            size: '6.7 oz',  price: 31, desc: 'In-shower gloss mask for instant, mirror-like shine.', img: IMG + 'IMG_6625.jpeg' },
                // Color Wow
                { id: 'cw-dream-coat',          brand: 'Color Wow',  name: 'Dream Coat Supernatural Spray',       size: '200 ml',  price: 30, desc: 'Award-winning anti-humidity treatment for frizz-free, glassy hair.', img: IMG + 'IMG_6624.jpeg' },
                { id: 'cw-dream-coat-xs',       brand: 'Color Wow',  name: 'Dream Coat Extra Strength',           size: '200 ml',  price: 32, desc: 'Ultra-moisturizing anti-frizz treatment for dry, porous hair.', img: IMG + 'IMG_6624.jpeg' },
                { id: 'cw-shine-spray',         brand: 'Color Wow',  name: 'Extra Mist-ical Shine Spray',         size: '162 ml',  price: 28, desc: 'Lightweight shine + heat-protection mist for glossy hair.', img: IMG + 'IMG_6624.jpeg' }
            ];

            var byId = {};
            PRODUCTS.forEach(function (p) { byId[p.id] = p; });

            function fmtPrice(price) {
                return typeof price === 'number' ? '$' + price.toFixed(2) : 'Ask in salon';
            }

            /* ----- Cart state (persisted to localStorage) ----- */
            var CART_KEY = 'thce-cart';
            var cart = [];
            try {
                var saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
                if (Array.isArray(saved)) {
                    cart = saved.filter(function (line) {
                        return line && byId[line.id] && line.qty > 0;
                    }).map(function (line) {
                        return { id: line.id, qty: Math.min(99, Math.max(1, line.qty | 0)) };
                    });
                }
            } catch (err) { cart = []; }

            function saveCart() {
                try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) {}
            }
            function cartCount() {
                return cart.reduce(function (n, line) { return n + line.qty; }, 0);
            }
            function findLine(id) {
                for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { return cart[i]; } }
                return null;
            }
            function addToCart(id) {
                var line = findLine(id);
                if (line) { line.qty = Math.min(99, line.qty + 1); }
                else { cart.push({ id: id, qty: 1 }); }
                saveCart(); updateCount(); renderCart();
            }
            function setQty(id, qty) {
                var line = findLine(id);
                if (!line) { return; }
                line.qty = qty;
                if (line.qty < 1) { cart = cart.filter(function (l) { return l.id !== id; }); }
                saveCart(); updateCount(); renderCart();
            }

            /* ----- Header cart button + count badge ----- */
            var cartToggle = document.getElementById('cartToggle');
            var cartCountEl = document.getElementById('cartCount');
            function updateCount() {
                var n = cartCount();
                if (!cartCountEl) { return; }
                cartCountEl.textContent = String(n);
                cartCountEl.hidden = n === 0;
                if (n > 0 && cartToggle) {
                    cartToggle.classList.remove('cart-toggle--bump');
                    void cartToggle.offsetWidth; // restart animation
                    cartToggle.classList.add('cart-toggle--bump');
                }
            }

            /* ----- Product grid + brand filters ----- */
            var filtersEl = document.getElementById('shopFilters');
            var brands = PRODUCTS.reduce(function (list, p) {
                if (list.indexOf(p.brand) === -1) { list.push(p.brand); }
                return list;
            }, []);
            var activeBrand = 'All';

            function renderFilters() {
                if (!filtersEl) { return; }
                ['All'].concat(brands).forEach(function (brand) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'shop-filter' + (brand === activeBrand ? ' is-active' : '');
                    b.textContent = brand;
                    b.setAttribute('aria-pressed', String(brand === activeBrand));
                    b.addEventListener('click', function () {
                        activeBrand = brand;
                        Array.prototype.forEach.call(filtersEl.children, function (chip) {
                            var on = chip === b;
                            chip.classList.toggle('is-active', on);
                            chip.setAttribute('aria-pressed', String(on));
                        });
                        renderGrid();
                    });
                    filtersEl.appendChild(b);
                });
            }

            function renderGrid() {
                while (shopGrid.firstChild) { shopGrid.removeChild(shopGrid.firstChild); }
                PRODUCTS.filter(function (p) {
                    return activeBrand === 'All' || p.brand === activeBrand;
                }).forEach(function (p) {
                    var card = document.createElement('article');
                    card.className = 'product-card';

                    var media = document.createElement('div');
                    media.className = 'product-card__media';
                    var img = document.createElement('img');
                    img.src = p.img;
                    img.alt = p.brand + ' ' + p.name;
                    img.loading = 'lazy';
                    media.appendChild(img);

                    var body = document.createElement('div');
                    body.className = 'product-card__body';

                    var brandEl = document.createElement('span');
                    brandEl.className = 'product-card__brand';
                    brandEl.textContent = p.brand;

                    var nameEl = document.createElement('h3');
                    nameEl.className = 'product-card__name';
                    nameEl.textContent = p.name;

                    var sizeEl = document.createElement('span');
                    sizeEl.className = 'product-card__size';
                    sizeEl.textContent = p.size;

                    var descEl = null;
                    if (p.desc) {
                        descEl = document.createElement('p');
                        descEl.className = 'product-card__desc';
                        descEl.textContent = p.desc;
                    }

                    var foot = document.createElement('div');
                    foot.className = 'product-card__foot';
                    var priceEl = document.createElement('span');
                    priceEl.className = 'product-card__price' + (typeof p.price === 'number' ? '' : ' product-card__price--tbd');
                    priceEl.textContent = fmtPrice(p.price);

                    var add = document.createElement('button');
                    add.type = 'button';
                    add.className = 'product-card__add';
                    add.textContent = 'Add';
                    add.setAttribute('aria-label', 'Add ' + p.name + ' to pickup list');
                    add.addEventListener('click', function () {
                        addToCart(p.id);
                        add.textContent = 'Added ✓';
                        add.classList.add('is-added');
                        setTimeout(function () {
                            add.textContent = 'Add';
                            add.classList.remove('is-added');
                        }, 1100);
                    });

                    foot.appendChild(priceEl);
                    foot.appendChild(add);
                    body.appendChild(brandEl);
                    body.appendChild(nameEl);
                    body.appendChild(sizeEl);
                    if (descEl) { body.appendChild(descEl); }
                    body.appendChild(foot);
                    card.appendChild(media);
                    card.appendChild(body);
                    shopGrid.appendChild(card);
                });
            }

            /* ----- Cart drawer ----- */
            var cartOverlay = document.getElementById('cartOverlay');
            var cartClose = document.getElementById('cartClose');
            var cartItemsEl = document.getElementById('cartItems');
            var cartFoot = document.getElementById('cartFoot');
            var reserveForm = document.getElementById('cartReserveForm');
            var cartStatus = document.getElementById('cartStatus');

            function openCart(open) {
                cartDrawer.hidden = !open;
                cartDrawer.setAttribute('aria-hidden', String(!open));
                if (cartOverlay) { cartOverlay.hidden = !open; }
                document.body.classList.toggle('cart-open', open);
                if (cartToggle) { cartToggle.setAttribute('aria-expanded', String(open)); }
                if (open) { renderCart(); }
            }

            function renderCart() {
                while (cartItemsEl.firstChild) { cartItemsEl.removeChild(cartItemsEl.firstChild); }

                if (!cart.length) {
                    var empty = document.createElement('p');
                    empty.className = 'cart-empty';
                    empty.textContent = 'Your pickup list is empty. Add products to reserve them.';
                    cartItemsEl.appendChild(empty);
                    if (cartFoot) { cartFoot.hidden = true; }
                    return;
                }
                if (cartFoot) { cartFoot.hidden = false; }

                var priced = 0, subtotal = 0;
                cart.forEach(function (line) {
                    var p = byId[line.id];
                    if (!p) { return; }
                    if (typeof p.price === 'number') { priced++; subtotal += p.price * line.qty; }

                    var row = document.createElement('div');
                    row.className = 'cart-item';

                    var thumb = document.createElement('img');
                    thumb.className = 'cart-item__thumb';
                    thumb.src = p.img;
                    thumb.alt = '';
                    thumb.loading = 'lazy';

                    var info = document.createElement('div');
                    info.className = 'cart-item__info';
                    var nm = document.createElement('span');
                    nm.className = 'cart-item__name';
                    nm.textContent = p.name;
                    var meta = document.createElement('span');
                    meta.className = 'cart-item__meta';
                    meta.textContent = p.brand + ' · ' + p.size + ' · ' + fmtPrice(p.price);
                    info.appendChild(nm);
                    info.appendChild(meta);

                    var qty = document.createElement('div');
                    qty.className = 'cart-qty';
                    var minus = document.createElement('button');
                    minus.type = 'button';
                    minus.className = 'cart-qty__btn';
                    minus.textContent = '−';
                    minus.setAttribute('aria-label', 'Decrease quantity of ' + p.name);
                    minus.addEventListener('click', function () { setQty(line.id, line.qty - 1); });
                    var num = document.createElement('span');
                    num.className = 'cart-qty__num';
                    num.textContent = String(line.qty);
                    var plus = document.createElement('button');
                    plus.type = 'button';
                    plus.className = 'cart-qty__btn';
                    plus.textContent = '+';
                    plus.setAttribute('aria-label', 'Increase quantity of ' + p.name);
                    plus.addEventListener('click', function () { setQty(line.id, line.qty + 1); });
                    qty.appendChild(minus);
                    qty.appendChild(num);
                    qty.appendChild(plus);

                    var remove = document.createElement('button');
                    remove.type = 'button';
                    remove.className = 'cart-item__remove';
                    remove.textContent = '×';
                    remove.setAttribute('aria-label', 'Remove ' + p.name);
                    remove.addEventListener('click', function () { setQty(line.id, 0); });

                    row.appendChild(thumb);
                    row.appendChild(info);
                    row.appendChild(qty);
                    row.appendChild(remove);
                    cartItemsEl.appendChild(row);
                });

                var totalRow = document.createElement('div');
                totalRow.className = 'cart-total';
                if (priced === cart.length) {
                    totalRow.textContent = 'Estimated total: $' + subtotal.toFixed(2);
                } else {
                    totalRow.textContent = 'Total confirmed at pickup';
                }
                cartItemsEl.appendChild(totalRow);
            }

            if (cartToggle) {
                cartToggle.addEventListener('click', function () { openCart(cartDrawer.hidden); });
            }
            if (cartClose) { cartClose.addEventListener('click', function () { openCart(false); }); }
            if (cartOverlay) { cartOverlay.addEventListener('click', function () { openCart(false); }); }
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && !cartDrawer.hidden) { openCart(false); }
            });

            if (reserveForm) {
                reserveForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    cartStatus.className = 'form-status';
                    cartStatus.textContent = '';

                    if (!cart.length) {
                        cartStatus.classList.add('is-error');
                        cartStatus.textContent = 'Your pickup list is empty.';
                        return;
                    }
                    var nameEl = document.getElementById('cartName');
                    var contactEl = document.getElementById('cartContact');
                    var name = nameEl.value.trim();
                    var contact = contactEl.value.trim();
                    var valid = true;
                    nameEl.classList.toggle('is-invalid', name === '');
                    contactEl.classList.toggle('is-invalid', contact === '');
                    if (name === '' || contact === '') { valid = false; }
                    if (!valid) {
                        cartStatus.classList.add('is-error');
                        cartStatus.textContent = 'Please add your name and a phone number or email.';
                        return;
                    }

                    var lines = cart.map(function (line) {
                        var p = byId[line.id];
                        return '• ' + line.qty + 'x ' + p.name + ' (' + p.size + ')';
                    });
                    var body = 'Product reservation for in-store pickup:\n' +
                        lines.join('\n') +
                        '\n\nName: ' + name +
                        '\nContact: ' + contact;
                    cartStatus.classList.add('is-success');
                    cartStatus.textContent = 'Opening your messages — send the text and we’ll set these aside.';
                    window.location.href = 'sms:' + SALON_SMS_SHOP + '&body=' + encodeURIComponent(body);
                });

                reserveForm.querySelectorAll('input').forEach(function (field) {
                    field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
                });
            }

            renderFilters();
            renderGrid();
            updateCount();
        }
    });
})();
