const root = document.documentElement;
const canvas = document.querySelector("#ambient-bg");
const ctx = canvas.getContext("2d");
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const cards = [...document.querySelectorAll(".social-card")];
const dotsWrap = document.querySelector(".dots");
const progress = document.querySelector(".progress-label b");
const status = document.querySelector(".status");
const copyHandle = document.querySelector(".copy-handle");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const bgTrack = document.querySelector("#bg-track");

let active = 0;
let dragStart = null;
let dragDelta = 0;
let didDrag = false;
let dragOffset = 0;
let particles = [];
bgTrack.volume = 0.72;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: 58 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
  }));
}

function drawAmbient() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawAmbient);
}

cards.forEach((card, index) => {
  card.style.setProperty("--a", card.dataset.colorA);
  card.style.setProperty("--b", card.dataset.colorB);
  const dotNode = document.createElement("button");
  dotNode.className = "dot";
  dotNode.type = "button";
  dotNode.setAttribute("aria-label", `Go to ${card.dataset.name}`);
  dotNode.addEventListener("click", () => setActive(index));
  dotsWrap.appendChild(dotNode);
});

function signedOffset(index) {
  const total = cards.length;
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function renderCarousel(offsetShift = 0) {
  cards.forEach((card, index) => {
    const offset = signedOffset(index) + offsetShift;
    const abs = Math.abs(offset);
    const clamped = Math.min(abs, 4);
    const x = offset * 176;
    const z = -clamped * 120;
    const rotate = offset * -34;
    const scale = 1 - clamped * 0.08;
    card.classList.toggle("is-active", Math.abs(offset) < 0.08);
    card.style.opacity = abs > 4 ? "0" : String(1 - clamped * 0.13);
    card.style.filter = offset === 0 ? "brightness(1)" : `brightness(${0.75 - clamped * 0.04}) blur(${clamped * 0.4}px)`;
    card.style.pointerEvents = abs <= 1 ? "auto" : "none";
    card.style.zIndex = String(20 - clamped);
    card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
  });

  [...dotsWrap.children].forEach((dotNode, index) => {
    dotNode.classList.toggle("active", index === active);
  });
  progress.textContent = `${active + 1}/${cards.length}`;
}

function setActive(index) {
  active = (index + cards.length) % cards.length;
  dragOffset = 0;
  renderCarousel();
  playUiSound();
}

function moveCursor(event) {
  const x = event.clientX;
  const y = event.clientY;
  root.style.setProperty("--mx", `${x}px`);
  root.style.setProperty("--my", `${y}px`);
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  ring.animate({ left: `${x}px`, top: `${y}px` }, { duration: 240, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" });
}

function makeSpark(x, y) {
  for (let i = 0; i < 9; i += 1) {
    const spark = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 22 + Math.random() * 42;
    spark.className = "spark";
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--sx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--sy", `${Math.sin(angle) * distance}px`);
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove());
  }
}

function playUiSound() {
  bgTrack.volume = 0.82;
  window.setTimeout(() => (bgTrack.volume = 0.72), 90);
}

document.querySelector(".carousel-zone").addEventListener("pointerdown", (event) => {
  dragStart = event.clientX;
  dragDelta = 0;
  dragOffset = 0;
  didDrag = false;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  event.preventDefault();
});

document.querySelector(".carousel-zone").addEventListener("pointermove", (event) => {
  if (dragStart === null) return;
  dragDelta = event.clientX - dragStart;
  if (Math.abs(dragDelta) > 8) didDrag = true;
  dragOffset = Math.max(-1.25, Math.min(1.25, dragDelta / 176));
  renderCarousel(dragOffset);
  event.preventDefault();
});

document.addEventListener("pointerup", (event) => {
  if (dragStart === null) return;
  const delta = event.clientX - dragStart;
  dragStart = null;
  if (Math.abs(delta) < 42) {
    dragOffset = 0;
    renderCarousel();
    return;
  }
  setActive(active + (delta < 0 ? 1 : -1));
});

cards.forEach((card) => {
  card.addEventListener("dragstart", (event) => event.preventDefault());
  card.addEventListener("click", (event) => {
    if (!didDrag) return;
    event.preventDefault();
    didDrag = false;
  });
});

prev.addEventListener("click", () => setActive(active - 1));
next.addEventListener("click", () => setActive(active + 1));
copyHandle.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyHandle.dataset.copy);
    status.textContent = "Copied";
  } catch {
    status.textContent = "@FLAMEKYRO";
  }
  window.setTimeout(() => (status.textContent = ""), 1200);
});

document.querySelectorAll(".magnetic").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    document.body.classList.add("hovering");
    playUiSound();
  });
  item.addEventListener("mouseleave", () => {
    document.body.classList.remove("hovering");
    item.style.transform = "";
  });
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
});

cards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
  });
});

document.addEventListener("mousemove", moveCursor);
document.addEventListener("click", (event) => makeSpark(event.clientX, event.clientY));
window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") setActive(active + 1);
  if (event.key === "ArrowLeft") setActive(active - 1);
});

function startBackgroundMusic() {
  bgTrack.play().catch(() => {
    status.textContent = "Click anywhere to start music";
  });
}

document.addEventListener("pointerdown", () => {
  if (bgTrack.paused) startBackgroundMusic();
}, { once: true });

resizeCanvas();
drawAmbient();
renderCarousel();
startBackgroundMusic();
