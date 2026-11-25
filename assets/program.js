/* Program page. Reads data/schedule.json and draws the week.
   Stars are saved in the visitor's own browser (localStorage). */

(function () {
  var root = document.getElementById("program");
  if (!root) return;

  var TYPES = {
    plenary: "Plenary",
    minisymposium: "Minisymposia",
    contributed: "Contributed talks",
    poster: "Posters",
    workshop: "Workshops and meetings",
    social: "Social events",
    general: "General",
    "break": "Break"
  };
  var FILTERS = ["plenary", "minisymposium", "contributed", "poster", "workshop", "social"];
  var STORE = "smb2027-my-schedule";
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17.1 6.6 20l1.1-6.1L3.2 9.6l6.1-.8z"/></svg>';

  var state = { day: "all", type: "all", q: "", mine: false };
  var stars = loadStars();
  var data = null;

  function loadStars() {
    try {
      var raw = localStorage.getItem(STORE);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveStars() {
    try { localStorage.setItem(STORE, JSON.stringify(stars)); } catch (e) { /* stars last for this visit only */ }
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function clock(t) {
    var p = t.split(":"), h = Number(p[0]), m = p[1];
    return { text: ((h + 11) % 12 + 1) + ":" + m, half: h < 12 ? "AM" : "PM" };
  }
  function timeRange(s, e) {
    var a = clock(s), b = clock(e);
    return a.half === b.half
      ? a.text + " – " + b.text + " " + b.half
      : a.text + " " + a.half + " – " + b.text + " " + b.half;
  }

  function matches(s) {
    if (state.day !== "all" && s.date !== state.day) return false;
    if (state.type !== "all" && s.type !== state.type) return false;
    if (state.mine && stars.indexOf(s.id) === -1) return false;
    if (state.q) {
      var hay = [s.title, s.room, s.note, s.track, TYPES[s.type]];
      (s.talks || []).forEach(function (t) { hay.push(t.title, t.speaker, t.affiliation, t.abstract); });
      if (hay.join(" ").toLowerCase().indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function talkList(s) {
    if (!s.talks || !s.talks.length) return "";
    var items = s.talks.map(function (t) {
      var who = [t.speaker, t.affiliation].filter(Boolean).join(", ");
      return "<li>" +
        (t.time ? '<span class="talk-time">' + esc(t.time) + "</span> " : "") +
        '<span class="talk-title">' + esc(t.title) + "</span>" +
        (who ? '<br><span class="talk-who">' + esc(who) + "</span>" : "") +
        (t.abstract ? '<p class="talk-abs">' + esc(t.abstract) + "</p>" : "") +
        "</li>";
    }).join("");
    return "<details><summary>" + s.talks.length + (s.talks.length === 1 ? " talk" : " talks") + '</summary><ul class="talks">' + items + "</ul></details>";
  }

  function slot(s) {
    var isBreak = s.type === "break";
    var starred = stars.indexOf(s.id) !== -1;
    var meta = [];
    if (!isBreak) meta.push('<span class="tag">' + esc(TYPES[s.type] || "") + "</span>");
    if (s.track) meta.push(esc(s.track));
    if (s.room) meta.push(esc(s.room));
    return '<li class="slot type-' + esc(s.type) + '">' +
      '<div class="slot-time">' + timeRange(s.start, s.end) + "</div>" +
      '<div class="slot-body"><h3>' + esc(s.title) + "</h3>" +
      (meta.length ? '<p class="slot-meta">' + meta.join(", ") + "</p>" : "") +
      (s.note ? '<p class="slot-note">' + esc(s.note) + "</p>" : "") +
      talkList(s) + "</div>" +
      (isBreak ? "<span></span>" :
        '<button class="star" type="button" data-id="' + esc(s.id) + '" aria-pressed="' + starred + '" aria-label="' +
        (starred ? "Remove " : "Add ") + esc(s.title) + (starred ? " from" : " to") + ' my schedule">' + STAR + "</button>") +
      "</li>";
  }

  function chip(group, value, text) {
    return '<button class="chip" type="button" data-group="' + group + '" data-value="' + esc(value) + '" aria-pressed="' + (state[group] === value) + '">' + esc(text) + "</button>";
  }

  function render() {
    var days = chip("day", "all", "All days") + data.days.map(function (d) { return chip("day", d.date, d.short); }).join("");
    var types = chip("type", "all", "Everything") + FILTERS.map(function (t) { return chip("type", t, TYPES[t]); }).join("");

    var body = "";
    var shown = 0;
    data.days.forEach(function (d) {
      var list = data.sessions.filter(function (s) { return s.date === d.date && matches(s); });
      // A day that only has breaks left after filtering is not worth showing.
      var real = list.filter(function (s) { return s.type !== "break"; }).length;
      if (!real) return;
      shown += real;
      list.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
      body += '<section class="day"><h2>' + esc(d.label) + '</h2><ol class="slots">' + list.map(slot).join("") + "</ol></section>";
    });

    if (!shown) {
      body = '<div class="empty">' +
        (state.mine && !stars.length
          ? "<h2>Your schedule is empty</h2><p>Select the star next to a session to add it. Your choices are saved in this browser on this device.</p>"
          : "<h2>No sessions match</h2><p>Clear the filters to see the full week.</p>") +
        '<button class="btn btn-outline" type="button" data-clear>Show the full week</button></div>';
    }

    var active = document.activeElement;
    var keep = active && active.id === "program-search";
    var focusStar = active && active.classList && active.classList.contains("star") ? active.getAttribute("data-id") : null;

    root.innerHTML =
      '<div class="program-tools">' +
      '<div class="tool-row"><span class="tool-label">Day</span>' + days + "</div>" +
      '<div class="tool-row"><span class="tool-label">Show</span>' + types + "</div>" +
      '<div class="tool-row"><label class="tool-label" for="program-search">Search</label>' +
      '<input class="search" id="program-search" type="search" placeholder="Title, speaker, or room" value="' + esc(state.q) + '">' +
      '<button class="chip mine-toggle" type="button" data-mine aria-pressed="' + state.mine + '">My schedule (' + stars.length + ")</button></div>" +
      "</div>" + body +
      '<p class="program-foot">Schedule last updated ' + esc(data.updated) + ". Times are Pacific Daylight Time. Starred sessions are saved in this browser on this device.</p>";

    if (keep) {
      var input = document.getElementById("program-search");
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (focusStar) {
      var again = root.querySelector('.star[data-id="' + focusStar + '"]');
      if (again) again.focus();
    }
  }

  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-group")) {
      state[t.getAttribute("data-group")] = t.getAttribute("data-value");
    } else if (t.hasAttribute("data-mine")) {
      state.mine = !state.mine;
    } else if (t.hasAttribute("data-clear")) {
      state = { day: "all", type: "all", q: "", mine: false };
    } else if (t.classList.contains("star")) {
      var id = t.getAttribute("data-id");
      var at = stars.indexOf(id);
      if (at === -1) stars.push(id); else stars.splice(at, 1);
      saveStars();
    } else {
      return;
    }
    render();
  });

  root.addEventListener("input", function (e) {
    if (e.target.id !== "program-search") return;
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  fetch("data/schedule.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { data = json; render(); })
    .catch(function () {
      root.innerHTML = '<p class="notice">The schedule could not be loaded. Reload the page. If it still does not appear, contact the organizers.</p>';
    });
})();
