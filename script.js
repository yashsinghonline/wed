/* =====================================================================
   Vijay & Rashmika — wedding invitation
   Plain JavaScript (no frameworks, no build step, no backend).
   ===================================================================== */
(function () {
  "use strict";

  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WEDDING_DATE = new Date("2026-10-26T10:00:00+05:30");
  var RSVP_KEY = "km-rsvp-vijay-rashmika";
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     Personalised greeting from ?to=Guest+Name
     ------------------------------------------------------------------ */
  (function guestName() {
    var to = new URLSearchParams(location.search).get("to");
    if (!to) return;
    var name = to.replace(/\+/g, " ").trim().slice(0, 60);
    if (!name) return;
    var el = $("#entry-guest");
    el.textContent = "Dear " + name + ", you are warmly invited";
    el.hidden = false;
  })();

  /* ------------------------------------------------------------------
     Hero — split names into animated characters, floating petals
     ------------------------------------------------------------------ */
  $$(".km-hero__name[data-chars]").forEach(function (h) {
    var text = h.getAttribute("data-chars");
    var start = parseFloat(h.getAttribute("data-start") || "0");
    h.textContent = "";
    text.split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "km-hero__char";
      s.textContent = ch;
      s.style.animationDelay = (start + i * 0.07) + "s";
      h.appendChild(s);
    });
  });

  (function heroPetals() {
    var wrap = $("#hero-petals");
    var data = [
      ["6%", "0s", "11s", "60px", 11], ["18%", "-3s", "13s", "-40px", 9], ["31%", "-7s", "12s", "50px", 12],
      ["47%", "-1.5s", "14s", "-70px", 8], ["62%", "-5s", "11.5s", "45px", 10], ["74%", "-9s", "12.5s", "-35px", 12],
      ["86%", "-2.5s", "13.5s", "55px", 9], ["94%", "-6s", "12s", "-60px", 10]
    ];
    data.forEach(function (p) {
      var s = document.createElement("span");
      s.className = "km-hero__petal";
      s.style.left = p[0];
      s.style.setProperty("--delay", p[1]);
      s.style.setProperty("--dur", p[2]);
      s.style.setProperty("--drift", p[3]);
      s.style.width = p[4] + "px";
      s.style.height = (p[4] * 1.5) + "px";
      wrap.appendChild(s);
    });
  })();

  /* ------------------------------------------------------------------
     Entry card + flower shower
     ------------------------------------------------------------------ */
  var entry = $("#entry");
  var opened = false;
  document.body.style.overflow = "hidden";

  var PETAL_COLORS = [
    "linear-gradient(135deg,#f9b233,#e8792a)", "linear-gradient(135deg,#ffcf5c,#f39c1f)",
    "linear-gradient(135deg,#f7b7c4,#e2718b)", "linear-gradient(135deg,#fff8e7,#f3e2b6)",
    "linear-gradient(135deg,#d94a5c,#a81d3a)", "linear-gradient(135deg,#f4d58d,#c9932f)"
  ];

  function flowerShower() {
    if (REDUCE) return;
    var wrap = $("#shower");
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 90; i++) {
      var size = 9 + Math.random() * 12;
      var round = Math.random() < 0.3;
      var s = document.createElement("span");
      s.className = "km-shower__petal";
      s.style.left = (Math.random() * 100) + "vw";
      s.style.width = size + "px";
      s.style.height = (round ? size : size * 1.55) + "px";
      s.style.borderRadius = round ? "50%" : "100% 0 100% 0";
      s.style.setProperty("--c", PETAL_COLORS[i % PETAL_COLORS.length]);
      s.style.setProperty("--delay", (Math.random() * 1.9) + "s");
      s.style.setProperty("--dur", (3.4 + Math.random() * 2.6) + "s");
      s.style.setProperty("--drift", ((Math.random() - 0.5) * 220) + "px");
      s.style.setProperty("--rot", (Math.random() * 360) + "deg");
      s.style.setProperty("--sway", (1.1 + Math.random() * 1.2) + "s");
      s.appendChild(document.createElement("i"));
      frag.appendChild(s);
    }
    wrap.appendChild(frag);
    setTimeout(function () { wrap.innerHTML = ""; }, 7500);
  }

  function openInvitation() {
    if (opened) return;
    opened = true;
    entry.classList.add("km-entry--closing");
    flowerShower();
    setTimeout(function () { entry.classList.add("km-entry--open"); }, 120);
    setTimeout(function () {
      document.body.style.overflow = "";
      document.documentElement.classList.add("km-opened");
      window.dispatchEvent(new Event("km:open"));
      var v = $(".km-hero__video");
      if (v && v.paused) v.play().catch(function () {});
    }, 420);
    setTimeout(function () { entry.remove(); }, 1300);
  }

  entry.addEventListener("click", openInvitation);
  $("#entry-open").addEventListener("click", function (e) { e.stopPropagation(); openInvitation(); });
  window.addEventListener("keydown", function (e) {
    if (!opened && (e.key === "Enter" || e.key === " " || e.key === "Escape")) openInvitation();
  });

  /* ------------------------------------------------------------------
     Scroll reveal (starts after the invitation is opened)
     ------------------------------------------------------------------ */
  function startReveal() {
    var targets = $$("[data-reveal]").concat($$(".km-gallery__cell"));
    if (REDUCE || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in", "is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add(en.target.classList.contains("km-gallery__cell") ? "is-revealed" : "is-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }
  window.addEventListener("km:open", startReveal, { once: true });

  /* ------------------------------------------------------------------
     Countdown
     ------------------------------------------------------------------ */
  (function countdown() {
  // Set the target date: November 20 of the current year at 00:00:00 local time
  var currentYear = new Date().getFullYear();
  var WEDDING_DATE = new Date(currentYear, 10, 20, 0, 0, 0); // Month is 0-indexed (10 = November)

  // If Nov 20 has already passed this year, roll over to next year
  if (WEDDING_DATE.getTime() - Date.now() <= 0) {
    WEDDING_DATE = new Date(currentYear + 1, 10, 20, 0, 0, 0);
  }

  var els = {};
  $$("[data-unit]").forEach(function (el) { els[el.getAttribute("data-unit")] = el; });
  var arrived = $(".km-countdown__arrived");
  var pad = function (n) { return String(n).padStart(2, "0"); };

  function tick() {
    var diff = WEDDING_DATE.getTime() - Date.now();
    if (diff <= 0) {
      $$(".km-countdown__unit").forEach(function (u) { u.hidden = true; });
      if (arrived) arrived.hidden = false;
      return;
    }
    els.days.textContent = pad(Math.floor(diff / 864e5));
    els.hours.textContent = pad(Math.floor((diff % 864e5) / 36e5));
    els.minutes.textContent = pad(Math.floor((diff % 36e5) / 6e4));
    els.seconds.textContent = pad(Math.floor((diff % 6e4) / 1e3));
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();
})();

  /* ------------------------------------------------------------------
     Wedding journey — dotted trail that draws itself on scroll
     ------------------------------------------------------------------ */
  (function journey() {
    var stage = $("#events-stage");
    var measure = $("#trail-measure");
    var maskPath = $("#trail-mask-path");
    var tip = $("#trail-tip");
    var stops = $$(".km-events__stop");
    var STAGE_H = 1583, START_Y = 237, END_Y = 1487;
    var total = measure.getTotalLength();
    maskPath.style.strokeDasharray = total;
    maskPath.style.strokeDashoffset = total;
    var raf = 0;

    function apply(p) {
      maskPath.style.strokeDashoffset = total * (1 - p);
      var pt = measure.getPointAtLength(total * p);
      tip.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
      tip.style.opacity = (p > 0.003 && p < 0.997) ? 1 : 0;
      stops.forEach(function (s, i) {
        var threshold = i === 0 ? 0.002 : i / (stops.length - 1) - 0.015;
        var lit = p >= threshold;
        s.classList.toggle("is-in", lit);
        $(".km-events__medallion", s).classList.toggle("is-lit", lit);
      });
    }

    if (REDUCE) { apply(1); return; }

    function update() {
      raf = 0;
      var r = stage.getBoundingClientRect();
      var startY = r.top + r.height * (START_Y / STAGE_H);
      var endY = r.top + r.height * (END_Y / STAGE_H);
      var scan = window.innerHeight * 0.72;
      apply(Math.min(1, Math.max(0, (scan - startY) / (endY - startY))));
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("km:open", onScroll);
  })();

  /* ------------------------------------------------------------------
     Gallery lightbox
     ------------------------------------------------------------------ */
  (function gallery() {
    var cells = $$(".km-gallery__cell");
    var srcs = cells.map(function (c) { return $("img", c).getAttribute("src"); });
    var box = $("#lightbox"), img = $("#lightbox-img");
    var cur = 0;
    cells.forEach(function (c, i) {
      c.style.transitionDelay = ((i % 2) * 90) + "ms";
      c.addEventListener("click", function () { show(i); });
    });
    function show(i) {
      cur = (i + srcs.length) % srcs.length;
      img.src = srcs[cur];
      img.alt = "Gallery photo " + (cur + 1);
      box.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function close() { box.hidden = true; document.body.style.overflow = ""; }
    $("#lightbox-close").addEventListener("click", close);
    $("#lightbox-prev").addEventListener("click", function () { show(cur - 1); });
    $("#lightbox-next").addEventListener("click", function () { show(cur + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    window.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  })();

  /* ------------------------------------------------------------------
     RSVP — saved locally in the guest's browser (no server)
     ------------------------------------------------------------------ */
  (function rsvp() {
    var PHONE_NUMBER = "917976731198"; // Enter target number with country code (e.g., 91 for India) without '+' or spaces

    var form = $("#rsvp-form"), wrap = $("#rsvp-form-wrap"), done = $("#rsvp-done");
    var fields = $("#rsvp-fields"), attendingOnly = $("#rsvp-attending-only");
    var nameIn = $("#rsvp-name"), submit = $("#rsvp-submit"), errorEl = $("#rsvp-error");
    var attending = null;

    function refresh() {
      fields.hidden = attending === null;
      attendingOnly.hidden = attending !== true;
      submit.disabled = attending === null || nameIn.value.trim().length < 2;
    }

    $$(".km-rsvp__choice").forEach(function (b) {
      b.addEventListener("click", function () {
        attending = b.getAttribute("data-attending") === "yes";
        $$(".km-rsvp__choice").forEach(function (x) {
          var on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-pressed", String(on));
        });
        refresh();
        if (attending !== null) setTimeout(function () { nameIn.focus({ preventScroll: true }); }, 50);
      });
    });

    $$(".km-rsvp__event").forEach(function (b) {
      b.addEventListener("click", function () {
        var on = !b.classList.contains("is-on");
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
    });

    nameIn.addEventListener("input", refresh);

    function showDone(name, yes) {
      $("#rsvp-done-title").textContent = yes ? "Thank You!" : "We'll Miss You";
      $("#rsvp-done-body").textContent = yes
        ? "Your blessings mean the world to us, " + name + ". We look forward to celebrating together!"
        : "We're grateful you took the time to respond, " + name + ". You'll be in our hearts.";
      wrap.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled || attending === null) return;

      var name = nameIn.value.trim();
      var guestsEl = $("#rsvp-guests");
      var kidsEl = $("#rsvp-kids");
      var wishesEl = $("#rsvp-wishes");

      var guests = guestsEl ? Number(guestsEl.value) || 1 : 1;
      var kids = kidsEl ? Number(kidsEl.value) || 0 : 0;
      var wishes = wishesEl ? wishesEl.value.trim() : "";

      // Fix: Convert NodeList to an Array before mapping
      var selectedEvents = Array.from($$(".km-rsvp__event.is-on")).map(function (b) {
        return b.getAttribute("data-event");
      });

      var record = {
        guestName: name,
        attending: attending,
        guests: guests,
        kids: kids,
        events: selectedEvents,
        message: wishes || null,
        respondedAt: new Date().toISOString()
      };

      try { localStorage.setItem(RSVP_KEY, JSON.stringify(record)); } catch (err) { /* private mode */ }

      // Construct WhatsApp Message
      var messageText = "*New Wedding RSVP*\n\n" +
        "*Name:* " + name + "\n" +
        "*Attending:* " + (attending ? "Yes 🎉" : "No 😔") + "\n";

      if (attending) {
        messageText += "*Guests:* " + guests + "\n";
        if (kids > 0) messageText += "*Kids:* " + kids + "\n";
        if (selectedEvents.length > 0) messageText += "*Events:* " + selectedEvents.join(", ") + "\n";
      }

      if (wishes) {
        messageText += "*Wishes:* " + wishes + "\n";
      }

      // Open WhatsApp Web/App
      var waUrl = "https://wa.me/" + PHONE_NUMBER + "?text=" + encodeURIComponent(messageText);
      window.open(waUrl, "_blank");

      submit.textContent = "Sending…";
      submit.disabled = true;
      if (errorEl) errorEl.hidden = true;
      setTimeout(function () { showDone(name, attending); }, 650);
    });

    $("#rsvp-change").addEventListener("click", function () {
      try { localStorage.removeItem(RSVP_KEY); } catch (err) { /* ignore */ }
      attending = null;
      $$(".km-rsvp__choice, .km-rsvp__event").forEach(function (x) {
        x.classList.remove("is-on");
        x.setAttribute("aria-pressed", "false");
      });
      var wishesEl = $("#rsvp-wishes");
      if (wishesEl) wishesEl.value = "";
      submit.textContent = "Send RSVP";
      refresh();
      done.hidden = true;
      wrap.hidden = false;
      $$("[data-reveal]", wrap).forEach(function (el) { el.classList.add("is-in"); });
    });

    try {
      var saved = JSON.parse(localStorage.getItem(RSVP_KEY) || "null");
      if (saved && typeof saved.guestName === "string" && typeof saved.attending === "boolean") {
        nameIn.value = saved.guestName;
        showDone(saved.guestName, saved.attending);
      }
    } catch (err) { /* ignore corrupt storage */ }
  })();

  /* ------------------------------------------------------------------
     Music bell — soft generated pad via Web Audio (no audio file)
     ------------------------------------------------------------------ */

(function music() {
    var bell = $("#bell"),
        icon = $("#bell-icon");
    var openInviteBtn = $("#entry-open"); // Play music when open invitation is clicked
    var ctx = null, stopFn = null, playing = false;

    function start() {
      if (stopFn) {
        stopFn();
        stopFn = null;
      }

      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!ctx) ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume();

      var gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);

      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 900; filter.Q.value = 0.6;
      filter.connect(gain);

      var oscs = [220, 277.18, 329.63, 440].map(function (f, i) {
        var o = ctx.createOscillator();
        o.type = i % 2 ? "sine" : "triangle";
        o.frequency.value = f;
        o.detune.value = (i - 1.5) * 4;
        var g = ctx.createGain();
        g.gain.value = 0.25 / (i + 1);
        o.connect(g); g.connect(filter); o.start();
        return o;
      });

      var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08; lfoGain.gain.value = 300;
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();

      stopFn = function () {
        var t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);
        setTimeout(function () {
          oscs.concat([lfo]).forEach(function (o) { try { o.stop(); } catch (e) { /* noop */ } });
        }, 1000);
      };
    }

    function setPlayingState(state) {
      playing = state;
      if (bell) {
        bell.classList.toggle("km-bell--playing", playing);
        bell.setAttribute("aria-pressed", String(playing));
        bell.setAttribute("aria-label", playing ? "Stop background music" : "Play background music");
      }
      if (icon) {
        icon.src = "/assets/kalyana-mandapam/km-audio-" + (playing ? "on" : "off") + ".png";
      }
    }

    if (bell) {
      bell.addEventListener("click", function () {
        playing = !playing;
        if (playing) {
          start();
        } else if (stopFn) {
          stopFn();
          stopFn = null;
        }
        setPlayingState(playing);
      });
    }

    if (openInviteBtn) {
      openInviteBtn.addEventListener("click", function () {
        if (!playing) {
          start();
          setPlayingState(true);
        }
      });
    }
  })();
})();
