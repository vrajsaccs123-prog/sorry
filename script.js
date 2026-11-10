(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const root = document.documentElement;
  document.addEventListener("pointermove", (event) => {
    root.style.setProperty("--mx", event.clientX + "px");
    root.style.setProperty("--my", event.clientY + "px");
  });

  const petalRoot = document.getElementById("petals");
  if (petalRoot && !reduce) {
    for (let i = 0; i < 16; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = Math.random() * 100 + "%";
      petal.style.width = 6 + Math.random() * 7 + "px";
      petal.style.height = 9 + Math.random() * 8 + "px";
      petal.style.animationDuration = 11 + Math.random() * 14 + "s";
      petal.style.animationDelay = -Math.random() * 18 + "s";
      petal.style.setProperty("--drift", Math.random() * 90 - 45 + "px");
      petal.style.opacity = String(0.28 + Math.random() * 0.45);
      petalRoot.appendChild(petal);
    }
  }

  let leaving = false;
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || reduce || leaving) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    const next = new URL(link.href, window.location.href);
    if (next.origin !== window.location.origin) return;
    if (next.pathname === window.location.pathname && next.hash === window.location.hash) return;
    event.preventDefault();
    leaving = true;
    document.body.classList.add("leaving");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 260);
  });

  const sign = document.getElementById("sign");
  const signNote = document.getElementById("signNote");
  if (sign && signNote) {
    sign.addEventListener("click", () => {
      sign.classList.remove("pulse");
      void sign.offsetWidth;
      sign.classList.add("pulse");
      signNote.hidden = false;
      sign.setAttribute("aria-expanded", "true");
    });
  }

  const psToggle = document.getElementById("psToggle");
  const ps = document.getElementById("ps");
  if (psToggle && ps) {
    psToggle.addEventListener("click", () => {
      const open = ps.hidden;
      ps.hidden = !open;
      psToggle.setAttribute("aria-expanded", open ? "true" : "false");
      psToggle.textContent = open ? "hide the postscript" : "read the postscript";
    });
  }

  function burst(host) {
    if (!host || reduce) return;
    const rect = host.getBoundingClientRect();
    for (let i = 0; i < 10; i += 1) {
      const bit = document.createElement("span");
      bit.className = "float-heart";
      bit.setAttribute("aria-hidden", "true");
      bit.textContent = i % 2 === 0 ? "♡" : "•";
      bit.style.left = 20 + Math.random() * Math.max(rect.width - 40, 20) + "px";
      bit.style.top = rect.height * 0.55 + "px";
      bit.style.animationDelay = i * 0.03 + "s";
      host.appendChild(bit);
      bit.addEventListener("animationend", () => bit.remove());
    }
  }

  const promiseButtons = document.querySelectorAll(".promise");
  const promiseStatus = document.getElementById("promiseStatus");
  const promiseDone = document.getElementById("promiseDone");
  if (promiseButtons.length) {
    const key = "rajvi-promises";
    let saved = [];
    try {
      saved = JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch (error) {
      saved = [];
    }

    const paint = (button, sealed) => {
      button.classList.toggle("sealed", sealed);
      button.setAttribute("aria-pressed", sealed ? "true" : "false");
      const seal = button.querySelector(".seal");
      if (seal) seal.textContent = sealed ? "kept" : "seal";
    };

    const persist = () => {
      const state = [...promiseButtons].map((button) => button.classList.contains("sealed"));
      sessionStorage.setItem(key, JSON.stringify(state));
      const count = state.filter(Boolean).length;
      if (promiseStatus) {
        promiseStatus.textContent = count + " of " + promiseButtons.length + " sealed";
      }
      if (promiseDone) {
        const wasHidden = promiseDone.hidden;
        promiseDone.hidden = count !== promiseButtons.length;
        if (count === promiseButtons.length && wasHidden) burst(promiseDone);
      }
    };

    promiseButtons.forEach((button, index) => {
      paint(button, Boolean(saved[index]));
      button.addEventListener("click", () => {
        paint(button, !button.classList.contains("sealed"));
        persist();
      });
    });
    persist();
  }

  const tray = document.getElementById("tray");
  const jarFill = document.getElementById("jarFill");
  const jar = document.getElementById("jar");
  const jarCount = document.getElementById("jarCount");
  const jarDone = document.getElementById("jarDone");
  const jarPieces = document.getElementById("jarPieces");
  if (tray && jarFill && jarPieces) {
    const buttons = [...tray.querySelectorAll(".churan")];
    const key = "rajvi-jar";
    let saved = [];
    try {
      saved = JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch (error) {
      saved = [];
    }

    const placeBit = (index, count) => {
      const bit = document.createElement("span");
      bit.className = "bit";
      bit.style.left = 16 + ((index * 41) % 62) + "%";
      bit.style.bottom = 5 + (count - 1) * 8 + "%";
      bit.style.background = index % 2
        ? "radial-gradient(circle at 35% 35%, #efc7a8, #8a4b32 72%)"
        : "radial-gradient(circle at 35% 35%, #f2d2b4, #c47b55 70%)";
      if (index % 3 === 0) bit.style.width = "0.88rem";
      jarPieces.appendChild(bit);
    };

    const render = () => {
      const count = saved.length;
      jarFill.style.height = (count / buttons.length) * 100 + "%";
      jar.classList.toggle("full", count === buttons.length);
      if (jarCount) jarCount.textContent = count + " of " + buttons.length + " pieces returned";
      if (jarDone) jarDone.hidden = count !== buttons.length;
    };

    const restoreBit = (index) => {
      placeBit(index, saved.indexOf(index) + 1);
    };

    buttons.forEach((button, index) => {
      if (saved.includes(index)) {
        button.disabled = true;
        restoreBit(index);
      }
      button.addEventListener("click", () => {
        if (button.disabled) return;
        button.disabled = true;
        saved.push(index);
        sessionStorage.setItem(key, JSON.stringify(saved));
        placeBit(index, saved.length);
        const wasDone = jarDone && !jarDone.hidden;
        render();
        if (jarDone && !jarDone.hidden && !wasDone) burst(jarDone);
      });
    });
    render();
  }

  const stage = document.getElementById("stage");
  const stageLine = document.getElementById("stageLine");
  const sorryCount = document.getElementById("sorryCount");
  const lineData = document.getElementById("sorryLines");
  if (stage && stageLine && lineData) {
    let lines = [];
    try {
      lines = JSON.parse(lineData.textContent);
    } catch (error) {
      lines = [stageLine.textContent];
    }
    let index = 0;

    const show = () => {
      stageLine.textContent = lines[index];
      stageLine.classList.remove("swap");
      void stageLine.offsetWidth;
      stageLine.classList.add("swap");
      if (sorryCount) sorryCount.textContent = index + 1 + " of " + lines.length;
    };

    stage.addEventListener("click", (event) => {
      const rect = stage.getBoundingClientRect();
      const fromKeyboard = event.detail === 0;
      const baseX = fromKeyboard ? rect.width / 2 : event.clientX - rect.left;
      const baseY = fromKeyboard ? rect.height / 2 : event.clientY - rect.top;
      if (!reduce) {
        for (let n = 0; n < 6; n += 1) {
          const heart = document.createElement("span");
          heart.className = "float-heart";
          heart.setAttribute("aria-hidden", "true");
          heart.textContent = n % 2 === 0 ? "♡" : "•";
          heart.style.left = baseX + (Math.random() * 48 - 24) + "px";
          heart.style.top = baseY + (Math.random() * 20 - 10) + "px";
          heart.style.fontSize = 0.9 + Math.random() * 0.7 + "rem";
          heart.style.animationDelay = n * 0.035 + "s";
          stage.appendChild(heart);
          heart.addEventListener("animationend", () => heart.remove());
        }
      }
      index = (index + 1) % lines.length;
      show();
    });
  }

  const songButton = document.createElement("button");
  songButton.type = "button";
  songButton.className = "song";
  songButton.id = "songToggle";
  const songMark = document.createElement("span");
  songMark.className = "song-mark";
  songMark.setAttribute("aria-hidden", "true");
  songMark.textContent = "♫";
  const songCopy = document.createElement("span");
  const songKicker = document.createElement("span");
  songKicker.className = "song-kicker";
  const songTitle = document.createElement("span");
  songTitle.className = "song-title";
  songCopy.append(songKicker, songTitle);
  songButton.append(songMark, songCopy);
  document.body.appendChild(songButton);

  const audio = new Audio("Bryan%20Adams%20-%20Please%20Forgive%20Me%20(Official%20Music%20Video).mp3");
  audio.preload = "auto";
  audio.volume = 0.32;
  const timeKey = "rajvi-song-time";
  const onKey = "rajvi-song-on";
  let wantSound = false;

  const paintSong = (on) => {
    songButton.classList.toggle("is-on", on);
    songButton.setAttribute("aria-pressed", on ? "true" : "false");
    songButton.setAttribute("aria-label", on ? "Pause Please Forgive Me" : "Play Please Forgive Me");
    songKicker.textContent = on ? "playing softly" : "bryan adams";
    songTitle.textContent = on ? "pause" : "please forgive me";
  };

  const remember = () => {
    const time = audio.currentTime || 0;
    sessionStorage.setItem(timeKey, String(audio.ended ? 0 : time));
    sessionStorage.setItem(onKey, wantSound && !audio.ended ? "1" : "0");
  };

  const seekSaved = () => {
    const time = Number(sessionStorage.getItem(timeKey) || 0);
    if (!Number.isFinite(time) || time <= 0) return;
    if (audio.duration && time >= audio.duration - 0.4) return;
    try {
      audio.currentTime = time;
    } catch (error) {
      /* metadata may still be settling */
    }
  };

  paintSong(false);

  audio.addEventListener("play", () => {
    wantSound = true;
    paintSong(true);
    remember();
  });

  audio.addEventListener("pause", () => {
    paintSong(false);
  });

  audio.addEventListener("ended", () => {
    wantSound = false;
    paintSong(false);
    remember();
  });

  audio.addEventListener("timeupdate", remember);

  songButton.addEventListener("click", () => {
    if (audio.paused) {
      wantSound = true;
      audio.play().catch(() => {
        wantSound = false;
        paintSong(false);
        remember();
      });
      return;
    }
    wantSound = false;
    audio.pause();
    remember();
  });

  window.addEventListener("pagehide", remember);

  if (sessionStorage.getItem(onKey) === "1") {
    const resume = () => {
      seekSaved();
      audio.play().catch(() => {
        wantSound = false;
        paintSong(false);
      });
    };
    if (audio.readyState >= 1) resume();
    else audio.addEventListener("loadedmetadata", resume, { once: true });
  }
})();
