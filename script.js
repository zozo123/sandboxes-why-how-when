/* The Sandbox Shift — tiny, no-deps interactivity.
   Three things: scroll reveals, back-to-top, and the decider. */
(function () {
  "use strict";

  /* ---------- 1. Scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 2. Back to top ---------- */
  var toTop = document.getElementById("totop");
  if (toTop) {
    var onScroll = function () {
      if (window.scrollY > 600) { toTop.classList.add("show"); }
      else { toTop.classList.remove("show"); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 3. The decider ---------- */
  // Isolation ladder rungs map 1:1 to <li data-tier> in the HTML.
  var TIERS = [
    "subprocess + limits",        // 0
    "namespaces + seccomp",       // 1
    "container",                  // 2
    "gVisor",                     // 3
    "microVM (Firecracker)",      // 4
    "full VM / air-gapped"        // 5
  ];

  var form = document.getElementById("d-form");
  if (!form) return;

  var elVerdict   = document.getElementById("d-verdict");
  var elRationale = document.getElementById("d-rationale");
  var elTier      = document.getElementById("d-tier-name");
  var elPlace     = document.getElementById("d-place-name");
  var ladder      = document.getElementById("ladder");

  function val(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? parseInt(checked.value, 10) : 0;
  }

  function compute() {
    var author = val("author"); // 0 me · 1 reviewed · 3 model-unreviewed
    var data   = val("data");   // 0 none · 1 public · 2 private · 3 secrets
    var scale  = val("scale");  // 0 once · 1 dev · 2 thousands
    var egress = val("egress"); // 0 none · 1 public · 2 internal

    // ---- tier: start from how much we distrust the code ----
    var tier = 0;
    if (author === 1) tier = 1;                 // reviewed → light fencing
    if (author === 3) tier = 3;                 // unreviewed model code → gVisor floor
    // untrusted code that can reach real data or the network → microVM
    if (author === 3 && (data >= 2 || egress >= 1)) tier = 4;
    // production secrets in reach → never go lighter than gVisor
    if (data === 3 && tier < 3) tier = 3;
    // thousands of disposable runs → microVMs earn their keep (fast boot + density)
    if (scale === 2 && tier >= 2) tier = 4;
    if (tier > 5) tier = 5;

    // ---- placement: inside the VPC vs outside / public ephemeral ----
    var needsInside = (data >= 2) || (egress === 2);
    var place = needsInside ? "Inside the VPC" : "Outside / public ephemeral";

    // ---- verdict level 0..3 ----
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

    // ---- rationale, assembled from the real inputs ----
    var bits = [];
    if (author === 3) bits.push("the code is model-written and unreviewed");
    else if (author === 1) bits.push("the code was reviewed");
    else bits.push("you wrote or read the code");

    if (data === 3) bits.push("it can reach production secrets");
    else if (data === 2) bits.push("it can reach private data / internal services");
    else if (data === 1) bits.push("it touches only public data");
    else bits.push("it touches nothing sensitive");

    if (scale === 2) bits.push("and it runs thousands of times in parallel");
    else if (scale === 1) bits.push("in an interactive dev loop");

    if (egress === 2) bits.push("with internal network egress");
    else if (egress === 1) bits.push("with public-internet egress");
    else bits.push("with no network");

    var rationale = "Because " + bits.join(", ") + ", aim for a "
      + TIERS[tier] + " boundary, " + place.toLowerCase() + ".";
    if (level === 0) {
      rationale = "Nothing here is untrusted or sensitive — a sandbox would cost more than it protects. "
        + "Add a timeout and a memory cap and move on.";
    }

    // ---- paint ----
    elVerdict.textContent = VERDICTS[level];
    elVerdict.className = "d-verdict lvl" + level;
    elRationale.textContent = rationale;
    elTier.textContent = (level === 0) ? "none needed" : TIERS[tier];
    elPlace.textContent = (level === 0) ? "—" : place;

    // ---- highlight the ladder rung ----
    if (ladder) {
      ladder.querySelectorAll("li").forEach(function (li) {
        var t = parseInt(li.getAttribute("data-tier"), 10);
        li.classList.toggle("pick", level !== 0 && t === tier);
      });
    }
  }

  form.addEventListener("change", compute);
  compute(); // initial paint
})();
