// shop.js: the shirts' bag on /shop/. Pick a size, add, check out in the store that prints them. The bag lives in this
// browser only (localStorage); checkout is a Shopify cart link (variant:quantity,…). No calls, no tracking, no keys.
(() => {
  "use strict";
  const KEY = "cg-bag",
    root = document.querySelector(".shop");
  if (!root) return;
  const bagEl = document.querySelector(".bag"),
    btn = document.querySelector(".bag-b"),
    list = bagEl.querySelector(".bag-items");
  const go = bagEl.querySelector(".bag-go"),
    sum = bagEl.querySelector(".bag-sum"),
    base = go.getAttribute("href");
  let bag = [];
  try {
    bag = JSON.parse(localStorage.getItem(KEY) || "[]").filter(
      (it) => it && /^\d+$/.test(it.vid) && it.q > 0
    );
  } catch (e) {
    bag = [];
  }
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(bag));
    } catch (e) {
      /* private mode: the bag lasts the visit */
    }
  };
  const money = (n) => "$" + n.toFixed(0);

  function render() {
    list.textContent = "";
    let n = 0,
      total = 0;
    bag.forEach((it, i) => {
      n += it.q;
      total += it.q * it.price;
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="bi-n"></span><span class="bi-s lab"></span><span class="bi-q"><button type="button" aria-label="One fewer">−</button><b></b><button type="button" aria-label="One more">+</button></span><span class="bi-p"></span>';
      li.querySelector(".bi-n").textContent = it.name;
      li.querySelector(".bi-s").textContent = it.size;
      li.querySelector("b").textContent = it.q;
      li.querySelector(".bi-p").textContent = money(it.q * it.price);
      const [minus, plus] = li.querySelectorAll("button");
      minus.onclick = () => {
        it.q -= 1;
        if (it.q <= 0) bag.splice(i, 1);
        save();
        render();
      };
      plus.onclick = () => {
        it.q = Math.min(it.q + 1, 9);
        save();
        render();
      };
      list.appendChild(li);
    });
    btn.hidden = n === 0;
    btn.querySelector("b").textContent = n;
    sum.textContent = n
      ? `${n} shirt${n > 1 ? "s" : ""} · ${money(total)}` +
        (total >= 70
          ? " · ships free to the U.S. and 31 European countries"
          : " · free shipping from $70 to the U.S. and 31 European countries")
      : "The bag is empty.";
    go.href = n ? base + bag.map((it) => `${it.vid}:${it.q}`).join(",") : base;
    go.toggleAttribute("aria-disabled", !n);
    if (!n) bagEl.hidden = true;
  }

  root.querySelectorAll(".shirt").forEach((card) => {
    const add = card.querySelector(".add"),
      sizes = [...card.querySelectorAll(".sizes button")];
    let pick = null;
    sizes.forEach((b) => {
      b.onclick = () => {
        sizes.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
        pick = b;
        add.disabled = false;
        add.textContent = `Add ${b.textContent} to bag · ${money(
          +card.dataset.price
        )}`;
      };
    });
    add.onclick = () => {
      if (!pick) return;
      const vid = pick.dataset.vid,
        hit = bag.find((it) => it.vid === vid);
      if (hit) hit.q = Math.min(hit.q + 1, 9);
      else
        bag.push({
          vid,
          q: 1,
          name: card.dataset.name,
          size: pick.textContent,
          price: +card.dataset.price,
        });
      save();
      render();
      bagEl.hidden = false;
    };
  });
  // the views: the shirt's image (and "The print") opens the print file in a dialog, "On a person" the generated photo of
  // it worn, front and back (Escape or × closes it)
  const dlg = document.querySelector(".sh-dlg"),
    dimg = dlg && dlg.querySelector("img");
  if (dlg && dlg.showModal) {
    root.querySelectorAll("[data-view]").forEach((b) => {
      b.onclick = () => {
        dimg.src = b.dataset.view;
        dimg.alt = b.dataset.alt;
        dlg.showModal();
      };
    });
    dlg.querySelector(".sh-dlg-x").onclick = () => dlg.close();
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
  }
  btn.onclick = () => {
    bagEl.hidden = !bagEl.hidden;
  };
  bagEl.querySelector(".bag-x").onclick = () => {
    bagEl.hidden = true;
  };
  go.addEventListener("click", (e) => {
    if (!bag.length) e.preventDefault();
  });
  render();
})();
