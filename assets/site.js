/* SMB 2027 shared site script.
   Edit the SETTINGS block to change links that appear on several pages. */

var SMB_SETTINGS = {
  // Jotform submissions form.
  formUrl: "https://form.jotform.com/263285122573053",

  // Registration link from SDMeetings. Leave "" until the link exists.
  registrationUrl: "",

  // Program contact shown in the footer and on the Organizers page.
  contactName: "Parisa Plant",
  contactEmail: "parisa.plant@sdsu.edu",

  // Set to false at launch to remove the grey "Preview site" strip.
  preview: true
};

(function () {
  var pages = [
    ["index.html", "Home"],
    ["program.html", "Program"],
    ["submissions.html", "Submissions"],
    ["registration.html", "Registration"],
    ["venue.html", "Venue and housing"],
    ["organizers.html", "Organizers"]
  ];

  var here = location.pathname.split("/").pop() || "index.html";

  function navLinks() {
    return pages.map(function (p) {
      var current = p[0] === here ? ' aria-current="page"' : "";
      return '<li><a href="' + p[0] + '"' + current + ">" + p[1] + "</a></li>";
    }).join("");
  }

  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      (SMB_SETTINGS.preview
        ? '<div class="preview-strip"><div class="wrap">Preview site for the organizing committee. Details may change.</div></div>'
        : "") +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html">SMB <span>2027</span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main"><ul class="nav-list">' + navLinks() + "</ul></nav>" +
      "</div></header>";

    var toggle = header.querySelector(".nav-toggle");
    var nav = header.querySelector(".site-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML =
      '<footer class="site-footer"><div class="wrap">' +
      "<div>" +
      '<p class="foot-name">SMB 2027</p>' +
      "<p>Annual Meeting of the Society for Mathematical Biology<br>June 27 to July 2, 2027, San Diego, California</p>" +
      "<p>Hosted by the Computational Science Research Center at San Diego State University, with the University of San Diego.</p>" +
      "</div>" +
      "<div><h2>Pages</h2><ul>" + navLinks() + "</ul></div>" +
      "<div><h2>Contact</h2>" +
      "<p>Program questions<br>" + SMB_SETTINGS.contactName + '<br><a href="mailto:' + SMB_SETTINGS.contactEmail + '">' + SMB_SETTINGS.contactEmail + "</a></p>" +
      '<p><a href="https://www.smb.org/">Society for Mathematical Biology</a></p>' +
      "</div>" +
      "</div></footer>";
  }

  // Key dates: mark past dates and the next upcoming one.
  var items = document.querySelectorAll(".dates li[data-date]");
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var nextMarked = false;
  Array.prototype.forEach.call(items, function (li) {
    var parts = li.getAttribute("data-date").split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (d < today) {
      li.classList.add("is-past");
    } else if (!nextMarked) {
      li.classList.add("is-next");
      nextMarked = true;
    }
  });

  // Registration button: shows a link only once a registration URL is set.
  var regSlots = document.querySelectorAll("[data-registration]");
  Array.prototype.forEach.call(regSlots, function (el) {
    if (SMB_SETTINGS.registrationUrl) {
      el.innerHTML = '<a class="btn" href="' + SMB_SETTINGS.registrationUrl + '" target="_blank" rel="noopener">Register for SMB 2027</a>';
    } else {
      el.innerHTML = '<p class="notice">Registration is not open yet. The registration link will appear here when it opens.</p>';
    }
  });

  // Submissions form: fill in the frame and the "open in a new tab" link.
  var frame = document.getElementById("submission-form");
  if (frame) {
    frame.src = SMB_SETTINGS.formUrl;
    // Jotform reports its height to the parent page. Resize the frame to fit.
    window.addEventListener("message", function (e) {
      if (typeof e.data !== "string" || !/jotform/.test(e.origin)) return;
      var parts = e.data.split(":");
      if (parts[0] === "setHeight" && Number(parts[1]) > 0) {
        frame.style.height = Number(parts[1]) + "px";
      }
    });
  }
  var formLinks = document.querySelectorAll("[data-form-link]");
  Array.prototype.forEach.call(formLinks, function (a) {
    a.href = SMB_SETTINGS.formUrl;
  });
})();
