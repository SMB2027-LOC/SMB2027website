/* Home page background: a Gray-Scott reaction-diffusion model.
   Two chemicals A and B diffuse and react on a small grid. The picture shows B.
   This is decoration. Removing the <canvas id="turing"> element removes it. */

(function () {
  var canvas = document.getElementById("turing");
  if (!canvas || !canvas.getContext) return;

  var W = 200, H = 120, N = W * H;
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");
  var img = ctx.createImageData(W, H);

  var A = new Float32Array(N), B = new Float32Array(N);
  var A2 = new Float32Array(N), B2 = new Float32Array(N);

  // Feed, kill and diffusion rates. These values grow branching "coral" stripes.
  var FEED = 0.055, KILL = 0.062, DA = 1.0, DB = 0.5;

  // Color ramp: navy, SMB blue, pale blue.
  var stops = [[10, 39, 64], [0, 86, 149], [176, 200, 228]];
  var lut = new Uint8ClampedArray(256 * 3);
  for (var i = 0; i < 256; i++) {
    var t = i / 255, a, b, f;
    if (t < 0.55) { a = stops[0]; b = stops[1]; f = t / 0.55; }
    else { a = stops[1]; b = stops[2]; f = (t - 0.55) / 0.45; }
    lut[i * 3] = a[0] + (b[0] - a[0]) * f;
    lut[i * 3 + 1] = a[1] + (b[1] - a[1]) * f;
    lut[i * 3 + 2] = a[2] + (b[2] - a[2]) * f;
  }

  function seed(cx, cy, r) {
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        var x = ((cx + dx) % W + W) % W, y = ((cy + dy) % H + H) % H;
        B[y * W + x] = 1;
      }
    }
  }

  function reset() {
    A.fill(1);
    B.fill(0);
    // Most seeds start on the right, away from the headline.
    for (var s = 0; s < 16; s++) {
      var x = Math.floor(W * (0.45 + 0.55 * Math.random()));
      var y = Math.floor(H * Math.random());
      seed(x, y, 2);
    }
    for (var k = 0; k < 3; k++) {
      seed(Math.floor(W * 0.4 * Math.random()), Math.floor(H * Math.random()), 2);
    }
  }

  function step() {
    for (var y = 0; y < H; y++) {
      var yc = y * W, ym = (y ? y - 1 : H - 1) * W, yp = (y < H - 1 ? y + 1 : 0) * W;
      for (var x = 0; x < W; x++) {
        var xm = x ? x - 1 : W - 1, xp = x < W - 1 ? x + 1 : 0, i = yc + x;
        var a = A[i], b = B[i];
        var la = (A[yc + xm] + A[yc + xp] + A[ym + x] + A[yp + x]) * 0.2 +
                 (A[ym + xm] + A[ym + xp] + A[yp + xm] + A[yp + xp]) * 0.05 - a;
        var lb = (B[yc + xm] + B[yc + xp] + B[ym + x] + B[yp + x]) * 0.2 +
                 (B[ym + xm] + B[ym + xp] + B[yp + xm] + B[yp + xp]) * 0.05 - b;
        var r = a * b * b;
        A2[i] = a + DA * la - r + FEED * (1 - a);
        B2[i] = b + DB * lb + r - (KILL + FEED) * b;
      }
    }
    var t = A; A = A2; A2 = t;
    t = B; B = B2; B2 = t;
  }

  function draw() {
    var d = img.data;
    for (var i = 0, p = 0; i < N; i++, p += 4) {
      var v = B[i] * 2.7;
      var c = (v <= 0 ? 0 : v >= 1 ? 255 : (v * 255) | 0) * 3;
      d[p] = lut[c]; d[p + 1] = lut[c + 1]; d[p + 2] = lut[c + 2]; d[p + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  var running = false, visible = true, steps = 0, budget = 9000, raf = 0;
  var button = document.getElementById("turing-toggle");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function label() {
    if (button) button.textContent = running ? "Pause" : "Play";
  }

  function frame() {
    raf = 0;
    if (!running || !visible || document.hidden) return;
    for (var k = 0; k < 10; k++) step();
    steps += 10;
    draw();
    if (steps >= budget) { running = false; label(); return; }
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (steps >= budget) budget = steps + 4000;
    running = true;
    label();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function pause() {
    running = false;
    label();
  }

  if (button) {
    button.addEventListener("click", function () {
      if (running) pause(); else play();
    });
  }

  // Dragging over the hero adds a spot of B.
  var hero = canvas.parentElement;
  var down = false;
  function poke(e) {
    if (e.target.closest && e.target.closest("a, button")) return;
    var rect = canvas.getBoundingClientRect();
    var scale = Math.max(rect.width / W, rect.height / H);
    var ox = (rect.width - W * scale) / 2, oy = (rect.height - H * scale) / 2;
    var gx = Math.floor((e.clientX - rect.left - ox) / scale);
    var gy = Math.floor((e.clientY - rect.top - oy) / scale);
    seed(gx, gy, 2);
    if (running) return;
    if (reduce) { draw(); return; }
    play();
  }
  hero.addEventListener("pointerdown", function (e) { down = true; poke(e); });
  hero.addEventListener("pointermove", function (e) { if (down) poke(e); });
  window.addEventListener("pointerup", function () { down = false; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && running && !raf) raf = requestAnimationFrame(frame);
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && running && !raf) raf = requestAnimationFrame(frame);
  });

  reset();
  draw();

  if (reduce) {
    // No animation. Compute a developed pattern in the background and show one still frame.
    var target = 3000;
    (function chunk() {
      for (var k = 0; k < 150; k++) step();
      steps += 150;
      if (steps < target) setTimeout(chunk, 0); else draw();
    })();
    label();
  } else {
    play();
  }
})();
