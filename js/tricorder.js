/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var gStardate, gSDBase;
var gSounds = {};

navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

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

  // Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
  // See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
  if (!gSDBase)
    gSDBase = new Date("September 8, 1966 20:30:00 EST");

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

var gModSound = {
  activate: function() {
    //gSounds.scan.play();
    if (navigator.getUserMedia) {
      document.getElementById("soundunavail").style.display = "none";
      document.getElementById("soundavail").style.display = "block";
      navigator.getUserMedia({ audio: true },
         function(aLocalMediaStream) {
           gModSound.mAudio.stream = aLocalMediaStream;
           gModSound.mAudio.context = new (window.AudioContext || window.webkitAudioContext)();
           gModSound.mAudio.input = gModSound.mAudio.context.createMediaStreamSource(gModSound.mAudio.stream);
           // Could put a filter in between like in http://webaudioapi.com/samples/microphone/
           gModSound.mDisplay.canvas = document.getElementById("soundcanvas");
           gModSound.mDisplay.context = gModSound.mDisplay.canvas.getContext("2d");
           gModSound.mDisplay.canvas.height = document.getElementById("soundavail").clientHeight - 2;
           gModSound.mDisplay.canvas.width = document.getElementById("soundavail").clientWidth;
           gModSound.mAudio.frequencySlices = (gModSound.mDisplay.canvas.width > 512) ?
                                              512 :
                                              Math.pow(2, Math.floor(Math.log(gModSound.mDisplay.canvas.width) / Math.LN2));
           console.log("slices: " + gModSound.mAudio.frequencySlices);
           gModSound.mAudio.analyzer = gModSound.mAudio.context.createAnalyser();
           // Make the FFT four times as large as needed as the upper three quarters turn out to be useless.
           gModSound.mAudio.analyzer.fftSize = gModSound.mAudio.frequencySlices * 4;
           console.log("FFT: " + gModSound.mAudio.analyzer.fftSize);
           gModSound.mAudio.input.connect(gModSound.mAudio.analyzer);
           gModSound.mDisplay.context.setTransform(1, 0, 0, -(gModSound.mDisplay.canvas.height/256), 0, gModSound.mDisplay.canvas.height);
           gModSound.mDisplay.active = true;
           window.requestAnimationFrame(gModSound.paintAnalyzerFrame);
         },
         function(err) {
           document.getElementById("soundunavail").style.display = "block";
           document.getElementById("soundavail").style.display = "none";
           console.log(err);
         }
      );
    }
    else {
      document.getElementById("soundunavail").style.display = "block";
      document.getElementById("soundavail").style.display = "none";
    }
  },
  mAudio: {
    frequencySlices: 32, // Must be a multiple of 2 (see AnalyserNode.fftSize)
  },
  mDisplay: {
    active: false,
  },
  paintAnalyzerFrame: function(aTimestamp) {
    var data = new Uint8Array(gModSound.mAudio.frequencySlices);
    gModSound.mAudio.analyzer.getByteFrequencyData(data);
    gModSound.mDisplay.context.clearRect(0, 0, gModSound.mDisplay.canvas.width, gModSound.mDisplay.canvas.height);
    // Out of experience, only the first half of the slices are actually useful.
    var wid = gModSound.mDisplay.canvas.width / gModSound.mAudio.frequencySlices;
    var fill = "#9C9CFF";
    for (var i = 0; i < gModSound.mAudio.frequencySlices; ++i) {
      var newFill = (data[i] > 200) ? "#FF0000" : ((data[i] > 100) ? "#FFCF00" : "#9C9CFF");
      if (fill != newFill) { gModSound.mDisplay.context.fillStyle = newFill; fill = newFill; }
      gModSound.mDisplay.context.fillRect(i*wid, 0, wid, data[i]);
    }
    if (gModSound.mDisplay.active)
      window.requestAnimationFrame(gModSound.paintAnalyzerFrame);
  },
  deactivate: function() {
    gModSound.mDisplay.active = false;
    gModSound.mAudio.stream.stop();
    gSounds.scan.pause();
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
