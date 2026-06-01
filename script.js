/* The Sandbox Shift — tiny, no-deps interactivity.
   Scroll reveals · the audience toggle · the decider. */
(function () {
  "use strict";

  /* ---------- scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- audience toggle: ARIA tabs (SWE / MLE / Researcher) ---------- */
  var seg = document.querySelector(".seg");
  var persona = document.getElementById("persona");
  if (seg && persona) {
    var tabs = Array.prototype.slice.call(seg.querySelectorAll('button[role="tab"]'));

    function selectTab(btn, focus) {
      var p = btn.getAttribute("data-p");
      tabs.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      persona.querySelectorAll("article").forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("data-p") === p);
      });
      if (focus) btn.focus();
    }

    seg.addEventListener("click", function (ev) {
      var btn = ev.target.closest('button[role="tab"]');
      if (btn) selectTab(btn, false);
    });

    seg.addEventListener("keydown", function (ev) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") n = (i + 1) % tabs.length;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
      else if (ev.key === "Home") n = 0;
      else if (ev.key === "End") n = tabs.length - 1;
      else return;
      ev.preventDefault();
      selectTab(tabs[n], true);
    });
  }

  /* ---------- the decider ---------- */
  var TIERS = [
    "subprocess + limits",      // 0
    "namespaces + seccomp",     // 1
    "container",                // 2
    "gVisor",                   // 3
    "microVM (Firecracker)",    // 4
    "full VM / air-gapped"      // 5
  ];

  var form = document.getElementById("d-form");
  if (!form) return;

  var elVerdict   = document.getElementById("d-verdict");
  var elRationale = document.getElementById("d-rationale");
  var elTier      = document.getElementById("d-tier-name");
  var elPlace     = document.getElementById("d-place-name");
  var ladder      = document.getElementById("ladder");

  function val(name) {
    var c = form.querySelector('input[name="' + name + '"]:checked');
    return c ? parseInt(c.value, 10) : 0;
  }

  function compute() {
    var author = val("author"); // 0 me · 1 reviewed · 3 model-unreviewed
    var data   = val("data");   // 0 none · 1 public · 2 private · 3 secrets
    var scale  = val("scale");  // 0 once · 1 dev · 2 thousands
    var egress = val("egress"); // 0 none · 1 public · 2 internal

    // tier — start from how much we distrust the author
    var tier = 0;
    if (author === 1) tier = 1;
    if (author === 3) tier = 3;                                   // unreviewed model code → gVisor floor
    if (author === 3 && (data >= 2 || egress >= 1)) tier = 4;     // untrusted + real reach → microVM
    if (data === 3 && tier < 3) tier = 3;                         // prod secrets in reach → never lighter than gVisor
    if (scale === 2 && tier >= 2) tier = 4;                       // thousands of runs → microVM density wins
    if (tier > 5) tier = 5;

    // placement
    var needsInside = (data >= 2) || (egress === 2);
    var place = needsInside ? "Inside the VPC" : "Outside / public ephemeral";

    // verdict level
    var level;
    if (author === 0 && data <= 1 && egress <= 1 && scale === 0) level = 0;
    else if (tier <= 1) level = 1;
    else if (tier <= 3) level = 2;
    else level = 3;

    var VERDICTS = [
      "Just run it — a sandbox is overhead here.",
      "Light isolation is enough.",
      "Sandbox it. Don't run this raw.",
      "Isolate aggressively — strongest box, tightest blast radius."
    ];

    // rationale assembled from the inputs
    var bits = [];
    bits.push(author === 3 ? "the code is model-written and unreviewed"
            : author === 1 ? "the code was reviewed"
            : "you wrote or read the code");
    bits.push(data === 3 ? "it can reach production secrets"
            : data === 2 ? "it can reach private data / internal services"
            : data === 1 ? "it touches only public data"
            : "it touches nothing sensitive");
    if (scale === 2) bits.push("and it runs thousands of times in parallel");
    else if (scale === 1) bits.push("in an interactive dev loop");
    bits.push(egress === 2 ? "with internal network egress"
            : egress === 1 ? "with public-internet egress"
            : "with no network");

    var rationale = "Because " + bits.join(", ") + ", aim for a "
      + TIERS[tier] + " boundary, " + place.toLowerCase() + ".";
    if (level === 0) {
      rationale = "Nothing here is untrusted or sensitive — a sandbox would cost more than it protects. "
        + "Add a timeout and a memory cap and move on.";
    }

    // paint
    elVerdict.textContent = VERDICTS[level];
    elVerdict.className = "d-verdict lvl" + level;
    elRationale.textContent = rationale;
    elTier.textContent = (level === 0) ? "none needed" : TIERS[tier];
    elPlace.textContent = (level === 0) ? "—" : place;

    if (ladder) {
      ladder.querySelectorAll("li").forEach(function (li) {
        li.classList.toggle("pick", level !== 0 && parseInt(li.getAttribute("data-tier"), 10) === tier);
      });
    }
  }

  form.addEventListener("change", compute);
  compute();
})();
