/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gStardate, gSDBase;

window.onload = function() {
  setTimeout(updateStardate, 0);
}

function updateStardate() {
  if (!gStardate)
    gStardate = document.getElementById("stardate");

  var curDate = new Date();

  if (!gSDBase)
    gSDBase = new Date("September 8, 1966 20:00:00 EST");

  var sdateval = (curDate - gSDBase) / (86400 * 365.2425);
  gStardate.textContent = sdateval.toFixed(1);

  setTimeout(updateStardate, 5*60*1000);
}

function switchModule(modname) {
  var sections = document.getElementsByTagName('section');
  for (var i = 0; i <= sections.length - 1; i++) {
    sections[i].classList.remove("active");
  }
  var navs = document.getElementById('navlist').children;
  for (var i = 0; i <= navs.length - 1; i++) {
    navs[i].classList.remove("active");
  }

  document.getElementById("nav" + modname).classList.add("active");
  document.getElementById("sect" + modname).classList.add("active");
}
