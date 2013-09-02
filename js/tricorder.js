/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gStardate, gSDBase;
var gSounds = {};

window.onload = function() {
  setTimeout(updateStardate, 0);
  gSounds.scan = new Audio("sound/scan.opus");
  gSounds.scan.loop = true;
  gSounds.launch = new Audio("sound/launch.opus");
  gSounds.shutdown = new Audio("sound/shutdown.opus");
  gSounds.keyaction = new Audio("sound/key-action.opus");
  gSounds.keypress = new Audio("sound/key-press.opus");

  document.getElementById("fullScreenButton").addEventListener("click",
      function(aEvent) { toggleFullscreen(); }, false);

  var navItems = document.getElementById("navlist").children;
  for (var i = 0; i <= navItems.length - 1; i++) {
    navItems[i].addEventListener("click",
        function(aEvent) {
          switchModule(aEvent.target.id.replace("nav", ""));
        }, false);
  }

  gSounds.launch.play();
  window.addEventListener("beforeunload", function( event ) {
    gSounds.shutdown.play();
  }, false);
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

function toggleFullscreen() {
  gSounds.keyaction.play();
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.webkitFullScreenElement && document.webkitFullScreenElement !== null)) {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
  else {
    var elem = document.getElementById("body");
    if (elem.requestFullScreen) {
      elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    }
  }
}

function switchModule(aModname) {
  gSounds.keyaction.play();
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

  var navItem = document.getElementById("nav" + aModname);
  navItem.classList.add("active");
  document.getElementById("sect" + aModname).classList.add("active");
  document.getElementById("mainHeader").textContent =
      (aModname == "Other") ? "Web Tricorder" : navItem.textContent;

  window["gMod" + aModname].activate();
}

var gModPos = {
  activate: function() {
    if (navigator.geolocation) {
      gSounds.scan.play();
      document.getElementById("posunavail").style.display = "none";
      document.getElementById("posavail").style.display = "block";
      this.watchID = navigator.geolocation.watchPosition(
        function(position) {
           document.getElementById("posLat").textContent =
               position.coords.latitude + "°";
           document.getElementById("posLong").textContent =
               position.coords.longitude + "°";
           document.getElementById("posAlt").textContent =
               position.coords.altitude.toFixed(0) + " m";
           document.getElementById("posAcc").textContent =
               position.coords.accuracy.toFixed(0) + " m";
           document.getElementById("posAltAcc").textContent =
               position.coords.altitudeAccuracy.toFixed(0) + " m";
           document.getElementById("posHead").textContent =
               position.coords.heading ? position.coords.heading.toFixed(0) + "°" : "---";
           document.getElementById("posSpd").textContent =
               position.coords.speed ? position.coords.speed.toFixed(1) + " m/s" : "---";
           var locTime = new Date(position.timestamp);
           document.getElementById("posTime").textContent = locTime.toISOString();
        },
        function(error) {
          // See https://developer.mozilla.org/en/Using_geolocation#Handling_errors
          if (error.message) {
            document.getElementById("posLat").textContent = error.message;
            document.getElementById("posLong").textContent = "...";
            document.getElementById("posAlt").textContent = "...";
            document.getElementById("posAcc").textContent = "...";
            document.getElementById("posAltAcc").textContent = "...";
            document.getElementById("posHead").textContent = "...";
            document.getElementById("posSpd").textContent = "...";
            document.getElementById("posTime").textContent = "...";
            setTimeout(function() { gModPos.deactivate(); }, 5000);
          }
          else {
            document.getElementById("posunavail").style.display = "block";
            document.getElementById("posavail").style.display = "none";
          }
          gSounds.scan.pause();
        },
        {enableHighAccuracy: true, maximumAge: 10000, timeout: 60000}
      );
    }
    else {
      document.getElementById("posunavail").style.display = "block";
      document.getElementById("posavail").style.display = "none";
    }
  },
  deactivate: function() {
    gSounds.scan.pause();
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
    gSounds.scan.play();
    document.getElementById("gravunavail").style.display = "none";
    document.getElementById("gravavail").style.display = "block";
    window.addEventListener("deviceorientation", this.orientEvent, true);
    window.addEventListener("devicemotion", this.motionEvent, true);
    setTimeout(function() {
      if ((document.getElementById("gravAlpha").textContent == "...") &&
          (document.getElementById("gravX").textContent == "...")) {
        gModGrav.deactivate();
      }
    }, 3000);
  },
  deactivate: function() {
    gSounds.scan.pause();
    window.removeEventListener("deviceorientation", this.orientEvent, true);
    window.removeEventListener("devicemotion", this.motionEvent, true);
    document.getElementById("gravunavail").style.display = "block";
    document.getElementById("gravavail").style.display = "none";
    //document.getElementById("gravAbs").textContent = "...";
    document.getElementById("gravAlpha").textContent = "...";
    document.getElementById("gravBeta").textContent = "...";
    document.getElementById("gravGamma").textContent = "...";
    document.getElementById("gravTotal").textContent = "...";
    document.getElementById("gravX").textContent = "...";
    document.getElementById("gravY").textContent = "...";
    document.getElementById("gravZ").textContent = "...";
    //document.getElementById("gravRot").textContent = "...";
  },
  orientEvent: function(orientData) {
    //document.getElementById("gravAbs").textContent = orientData.absolute;
    document.getElementById("gravAlpha").textContent = orientData.alpha.toFixed(1) + "°";
    document.getElementById("gravBeta").textContent = orientData.beta.toFixed(1) + "°";
    document.getElementById("gravGamma").textContent = orientData.gamma.toFixed(1) + "°";
  },
  motionEvent: function(event) {
    var gravTotal = 
        Math.sqrt(Math.pow(event.accelerationIncludingGravity.x, 2) +
                  Math.pow(event.accelerationIncludingGravity.y, 2) +
                  Math.pow(event.accelerationIncludingGravity.z, 2));
    document.getElementById("gravTotal").textContent = gravTotal.toFixed(2) + " m/s²";
    document.getElementById("gravX").textContent = event.accelerationIncludingGravity.x.toFixed(2) + " m/s²";
    document.getElementById("gravY").textContent = event.accelerationIncludingGravity.y.toFixed(2) + " m/s²";
    document.getElementById("gravZ").textContent = event.accelerationIncludingGravity.z.toFixed(2) + " m/s²";
    //document.getElementById("gravRot").textContent = event.rotationRate;
  },
}


var gModDev = {
  activate: function() {
    gSounds.scan.play();
    this.batteryTimer =
        setInterval(function () { gModDev.updateBattery(); }, 100);
  },
  deactivate: function() {
    clearTimeout(this.batteryTimer);
    gSounds.scan.pause();
  },
  updateBattery: function() {
    document.getElementById("devBattLevel").textContent =
        (navigator.battery.level * 100).toFixed(1) + "%";
    if (navigator.battery.charging) {
      if (navigator.battery.chargingTime == 0 ||
          navigator.battery.chargingTime == Infinity) {
        document.getElementById("devBattStatus").textContent = "charging";
      }
      else {
        document.getElementById("devBattStatus").textContent = 
            "charging, " + navigator.battery.chargingTime + "s remaining";
      }
    }
    else {
      if (navigator.battery.dischargingTime == 0 ||
          navigator.battery.dischargingTime == Infinity) {
        document.getElementById("devBattStatus").textContent = "discharging";
      }
      else {
        document.getElementById("devBattStatus").textContent = 
            navigator.battery.dischargingTime + "s usage remaining";
      }
    }
  },
  batteryTimer: null,
}

var gModNull = {
  activate: function() {
    //gSounds.scan.play();
  },
  deactivate: function() {
    gSounds.scan.pause();
  },
}

var gModOther = {
  activate: function() {
    //gSounds.scan.play();
  },
  deactivate: function() {
    gSounds.scan.pause();
  },
}

var gModNull = {
  activate: function() {
    //gSounds.scan.play();
  },
  deactivate: function() {
    gSounds.scan.pause();
  },
}
