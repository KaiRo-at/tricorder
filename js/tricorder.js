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
    if (sections[i].classList.contains("active")) {
      window["gMod" + sections[i].id.replace("sect", "")].deactivate();
      sections[i].classList.remove("active");
    }
  }
  var navs = document.getElementById('navlist').children;
  for (var i = 0; i <= navs.length - 1; i++) {
    navs[i].classList.remove("active");
  }

  document.getElementById("nav" + modname).classList.add("active");
  document.getElementById("sect" + modname).classList.add("active");

  window["gMod" + modname].activate();
}

var gModPos = {
  activate: function() {
    if (navigator.geolocation) {
      document.getElementById("posunavail").style.display = "none";
      document.getElementById("posavail").style.display = "block";
      this.watchID = navigator.geolocation.watchPosition(
        function(position) {
           document.getElementById("posLat").textContent = position.coords.latitude;
           document.getElementById("posLong").textContent = position.coords.longitude;
           document.getElementById("posAlt").textContent = position.coords.altitude;
           document.getElementById("posAcc").textContent = position.coords.accuracy;
           document.getElementById("posAltAcc").textContent = position.coords.altitudeAccuracy;
           document.getElementById("posHead").textContent = position.coords.heading || "---";
           document.getElementById("posSpd").textContent = position.coords.speed || "---";
           var locTime = new Date(position.timestamp);
           document.getElementById("posTime").textContent = locTime.toISOString();
        },
        function(error) {
          // See https://developer.mozilla.org/en/Using_geolocation#Handling_errors
          document.getElementById("posLat").textContent = error.message;
          document.getElementById("posLong").textContent = "...";
          document.getElementById("posAlt").textContent = "...";
          document.getElementById("posAcc").textContent = "...";
          document.getElementById("posAltAcc").textContent = "...";
          document.getElementById("posHead").textContent = "...";
          document.getElementById("posSpd").textContent = "...";
          document.getElementById("posTime").textContent = "...";
        },
        {enableHighAccuracy: true}
      );
    }
    else {
      document.getElementById("posunavail").style.display = "block";
      document.getElementById("posavail").style.display = "none";
    }
  },
  deactivate: function() {
    if (this.watchID) {
      navigator.geolocation.clearWatch(this.watchID);
    }
    document.getElementById("posunavail").style.display = "block";
    document.getElementById("posavail").style.display = "none";
    document.getElementById("posLat").textContent = "...";
    document.getElementById("posLong").textContent = "...";
    document.getElementById("posAlt").textContent = "...";
    document.getElementById("posAcc").textContent = "...";
    document.getElementById("posAltAcc").textContent = "...";
    document.getElementById("posHead").textContent = "...";
    document.getElementById("posSpd").textContent = "...";
    document.getElementById("posTime").textContent = "...";
  },
  watchID: null,
}

var gModGrav = {
  activate: function() {
    document.getElementById("gravunavail").style.display = "none";
    document.getElementById("gravavail").style.display = "block";
    window.addEventListener("deviceorientation", this.orientEvent, true);
    window.addEventListener("devicemotion", this.motionEvent, true);
  },
  deactivate: function() {
    window.removeEventListener("deviceorientation", this.orientEvent, true);
    window.removeEventListener("devicemotion", this.motionEvent, true);
    document.getElementById("gravunavail").style.display = "block";
    document.getElementById("gravavail").style.display = "none";
  },
  orientEvent: function(orientData) {
    //document.getElementById("gravAbs").textContent = orientData.absolute;
    document.getElementById("gravAlpha").textContent = orientData.alpha.toFixed(1) + "°";
    document.getElementById("gravBeta").textContent = orientData.beta.toFixed(1) + "°";
    document.getElementById("gravGamma").textContent = orientData.gamma.toFixed(1) + "°";
  },
  motionEvent: function(event) {
    document.getElementById("gravX").textContent = event.accelerationIncludingGravity.x.toFixed(2) + " m/s²";
    document.getElementById("gravY").textContent = event.accelerationIncludingGravity.y.toFixed(2) + " m/s²";
    document.getElementById("gravZ").textContent = event.accelerationIncludingGravity.z.toFixed(2) + " m/s²";
    //document.getElementById("gravRot").textContent = event.rotationRate;
  },
}

var gModAcou = {
  activate: function() {},
  deactivate: function() {},
}

var gModNull = {
  activate: function() {},
  deactivate: function() {},
}
