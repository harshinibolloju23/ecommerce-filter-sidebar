const state = { categories: [], minPrice: 0, maxPrice: 0, minRating: 0, sort: "default" };
const bounds = { min: 0, max: 0 };
const $ = (id) => document.getElementById(id);
let timer;

async function init() {
  const meta = await (await fetch("/api/meta")).json();
  bounds.min = meta.min_price;
  bounds.max = meta.max_price;

  $("categoryList").innerHTML = meta.categories.map((c) =>
    `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("");
  $("ratingList").innerHTML =
    `<label><input type="radio" name="rating" value="0" checked> Any</label>` +
    [1, 2, 3, 4, 5].map((n) =>
      `<label><input type="radio" name="rating" value="${n}"> ${n}★ & up</label>`).join("");

  [$("minRange"), $("maxRange")].forEach((r) => {
    r.min = bounds.min; r.max = bounds.max; r.step = 50;
  });

  $("categoryList").addEventListener("change", () => {
    state.categories = [...document.querySelectorAll("#categoryList input:checked")].map((i) => i.value);
    load();
  });
  $("ratingList").addEventListener("change", (e) => { state.minRating = Number(e.target.value); load(); });
  $("minRange").addEventListener("input", () => onRange("min"));
  $("maxRange").addEventListener("input", () => onRange("max"));
  $("sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; load(); });
  $("resetSide").addEventListener("click", resetFilters);
  $("resetEmpty").addEventListener("click", resetFilters);

  resetFilters();
}

function onRange(which) {
  let lo = Number($("minRange").value), hi = Number($("maxRange").value);
  if (lo > hi) {
    if (which === "min") { lo = hi; $("minRange").value = lo; }
    else { hi = lo; $("maxRange").value = hi; }
  }
  state.minPrice = lo; state.maxPrice = hi;
  updateSlider();
  clearTimeout(timer);
  timer = setTimeout(load, 120);   // small debounce while dragging
}

function updateSlider() {
  const span = bounds.max - bounds.min || 1;
  const left = ((state.minPrice - bounds.min) / span) * 100;
  const right = ((state.maxPrice - bounds.min) / span) * 100;
  $("fill").style.left = left + "%";
  $("fill").style.width = (right - left) + "%";
  $("minLabel").textContent = "₹" + state.minPrice;
  $("maxLabel").textContent = "₹" + state.maxPrice;
}

function resetFilters() {
  state.categories = []; state.minRating = 0;
  state.minPrice = bounds.min; state.maxPrice = bounds.max;
  document.querySelectorAll("#categoryList input").forEach((i) => (i.checked = false));
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  $("minRange").value = bounds.min; $("maxRange").value = bounds.max;
  updateSlider();
  load();
}

async function load() {
  const params = new URLSearchParams({
    categories: state.categories.join(","),
    min_price: state.minPrice,
    max_price: state.maxPrice,
    min_rating: state.minRating,
    sort: state.sort,
  });
  const data = await (await fetch("/api/products?" + params)).json();
  render(data.products, data.count);
}

function stars(r) {
  const full = Math.round(r);
  return "★".repeat(full) + "☆".repeat(5 - full) + ` ${r}`;
}

function thumb(p) {
  const colors = { Electronics: "#dbeafe", Apparel: "#fce7f3", Footwear: "#dcfce7" };
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>
    <rect width='100%' height='100%' fill='${colors[p.category] || "#e5e7eb"}'/>
    <text x='50%' y='50%' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='#374151'>${p.name[0]}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function render(products, count) {
  $("resultCount").textContent = `${count} item(s)`;
  $("grid").classList.toggle("hidden", count === 0);
  $("empty").classList.toggle("hidden", count !== 0);
  $("grid").innerHTML = products.map((p) => `
    <div class="card">
      <img src="${thumb(p)}" alt="${p.name}">
      <div class="info">
        <div class="name">${p.name}</div>
        <div class="price">₹${p.price}</div>
        <div class="stars">${stars(p.rating)}</div>
      </div>
    </div>`).join("");
}

init();