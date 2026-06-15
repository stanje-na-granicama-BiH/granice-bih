/* Granice BiH — učitavanje stanja iz /status.json i bojenje indikatora. */
(function () {
  "use strict";

  var NAZIVI = {
    zeleno: "Bez gužve",
    zuto: "Pojačan promet",
    narandzasto: "Gužva",
    crveno: "Velika gužva",
    nepoznato: "Nema podatka"
  };

  function klasa(s) {
    return NAZIVI.hasOwnProperty(s) ? "s-" + s : "s-nepoznato";
  }
  function naziv(s) {
    return NAZIVI[s] || NAZIVI.nepoznato;
  }

  function primijeni(podaci) {
    // Vrijeme ažuriranja
    var az = document.querySelectorAll("[data-azurirano]");
    for (var i = 0; i < az.length; i++) az[i].textContent = podaci.azurirano || "—";

    // Upozorenje ako su podaci stariji od 26 sati
    if (podaci.azurirano_iso) {
      var staro = (Date.now() - new Date(podaci.azurirano_iso).getTime()) > 26 * 3600 * 1000;
      var banner = document.getElementById("staro-upozorenje");
      if (banner && staro) banner.style.display = "block";
    }

    // Globalna napomena (npr. EES, zatvaranja)
    if (podaci.globalna_napomena) {
      var g = document.getElementById("globalna-napomena");
      if (g) { g.textContent = podaci.globalna_napomena; g.style.display = "block"; }
    }

    // Indikatori po prelazu
    var tacke = document.querySelectorAll("[data-prelaz]");
    for (var j = 0; j < tacke.length; j++) {
      var el = tacke[j];
      var slug = el.getAttribute("data-prelaz");
      var smjer = el.getAttribute("data-smjer"); // "ulaz" | "izlaz"
      var st = (podaci.prelazi && podaci.prelazi[slug] && podaci.prelazi[slug][smjer]) || "nepoznato";
      var dot = el.querySelector(".dot");
      if (dot) {
        dot.className = dot.className.replace(/\bs-[a-z]+\b/g, "").trim() + " " + klasa(st);
      }
      el.setAttribute("title", naziv(st));
      var txt = el.querySelector("[data-tekst]");
      if (txt) txt.textContent = naziv(st);
      var sr = el.querySelector(".sr");
      if (sr) sr.textContent = naziv(st);
    }

    // Info poruka na stranici prelaza
    var info = document.querySelector("[data-info-prelaz]");
    if (info) {
      var s2 = info.getAttribute("data-info-prelaz");
      var poruka = podaci.prelazi && podaci.prelazi[s2] && podaci.prelazi[s2].info;
      if (poruka) { info.textContent = poruka; info.style.display = "block"; }
    }
  }

  var STATUS_URL = (window.STATUS_URL || "status.json");
  fetch(STATUS_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(primijeni)
    .catch(function () {
      var az = document.querySelectorAll("[data-azurirano]");
      for (var i = 0; i < az.length; i++) az[i].textContent = "nedostupno";
    });
})();
