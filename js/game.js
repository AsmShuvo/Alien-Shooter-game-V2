// This file contains all the logic for the Alien Shooter game.
(function () {
  // Simple shortcuts for selecting elements and clamping numbers
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Manages all sound effects for the game.
  class Sound {
    constructor() {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
    // Generic sound generator
    beep(freq = 440, dur = 0.06, type = "sine", gain = 0.12) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    }
    // Player shooting sound
    shoot() {
      this.beep(1200, 0.04, "square", 0.12);
    }
    // Enemy explosion sound
    explosion() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(400, now);
      o.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(now);
      o.stop(now + 0.4);
    }
    // Background ambient sound
    ambience() {
      if (!this.ctx) return null;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = 60;
      g.gain.value = 0.01;
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      return { osc: o, gain: g };
    }
  }

  // Represents the player's ship.
  class Player {
    constructor(container, sound) {
      this.container = container;
      this.el = document.getElementById("player");
      if (!this.el) {
        this.el = document.createElement("div");
        this.el.id = "player";
        this.el.className = "player";
        this.container.appendChild(this.el);
      }
      this.w = 64;
      this.h = 64;
      this.x = Math.round((this.container.clientWidth - this.w) / 2);
      this.y = 20;
      this.speed = 9;
      this.health = 5;
      this.canShoot = true;
      this.cooldown = 180;
      this.sound = sound;

      // Set up the player element's style
      this.el.style.width = this.w + "px";
      this.el.style.height = this.h + "px";
      this.el.style.position = "absolute";
      this.el.style.bottom = this.y + "px";
      this.el.style.left = this.x + "px";
      this.el.style.zIndex = 50;
      // image
      try {
        // Try to load the player image from assets.js
        if (window.Images) {
          const img = window.Images.get("player");
          if (img) {
            img.style.width = "100%";
            img.style.height = "100%";
            this.el.innerHTML = "";
            this.el.appendChild(img.cloneNode(true));
          }
        }
      } catch (e) {}
      // Fallback if image loading fails
      if (!this.el.innerHTML.trim()) {
        this.el.style.background = "linear-gradient(180deg,#00f6ff,#00b4d8)";
      }
    }
    // Updates the player's position on screen
    render() {
      if (isNaN(this.x)) this.x = 0;
      this.el.style.left = Math.round(this.x) + "px";
    }
    // Moves the player left or right
    move(dir) {
      this.x = clamp(
        this.x + dir * this.speed,
        0,
        this.container.clientWidth - this.w
      );
    }
    // Creates a new bullet if the player can shoot
    shoot() {
      if (!this.canShoot) return null;
      this.canShoot = false;
      setTimeout(() => (this.canShoot = true), this.cooldown);
      this.sound.shoot();
      const b = document.createElement("div");
      b.className = "bullet";
      b.style.position = "absolute";
      const left = this.x + this.w / 2 - 5;
      b.style.left = left + "px";
      b.style.bottom = this.y + 44 + "px";
      b.style.width = "10px";
      b.style.height = "22px";
      this.container.appendChild(b);
      return b;
    }
  }

  // Represents a single enemy.
  class Enemy {
    constructor(container, type, x) {
      this.container = container;
      this.type = type;
      this.x = x;
      this.y = -80;
      if (type === "alien") {
        // Alien properties
        this.w = 44;
        this.h = 44;
        this.speed = 1.6 + Math.random();
        this.score = 1;
        this.key = "alien";
      } else if (type === "ufo") {
        // UFO properties
        this.w = 56;
        this.h = 30;
        this.speed = 2.4 + Math.random();
        this.score = 3;
        this.key = "ufo";
      } else {
        // Spacejet properties
        this.w = 70;
        this.h = 20;
        this.speed = 3.6 + Math.random();
        this.score = 5;
        this.key = "spacejet";
      }
      this.el = document.createElement("div");
      // Set up the enemy element's style
      this.el.className = "enemy";
      this.el.style.position = "absolute";
      this.el.style.left = this.x + "px";
      this.el.style.top = this.y + "px";
      this.el.style.width = this.w + "px";
      this.el.style.height = this.h + "px";
      this.el.style.zIndex = 40;
      try {
        // Try to load the enemy image from assets.js
        if (window.Images) {
          const img = window.Images.get(this.key);
          if (img) {
            const node = img.cloneNode(true);
            node.style.width = "100%";
            node.style.height = "100%";
            this.el.appendChild(node);
          }
        }
      } catch (e) {}
      // Fallback if image loading fails
      if (!this.el.innerHTML.trim()) {
        this.el.style.background =
          this.type === "alien"
            ? "#7fff00"
            : this.type === "ufo"
            ? "#8e24aa"
            : "#ff9800";
        this.el.style.borderRadius = "8px";
      }
      this.container.appendChild(this.el);
    }
    // Moves the enemy down the screen
    update() {
      this.y += this.speed;
      this.el.style.top = Math.round(this.y) + "px";
    }
    // Removes the enemy from the game
    destroy() {
      try {
        this.el.remove();
      } catch (e) {}
    }
  }

  // Simple collision detection between two rectangles.
  function coll(a, b) {
    return !(
      a.bottom < b.top ||
      a.top > b.bottom ||
      a.right < b.left ||
      a.left > b.right
    );
  }

  // The main class that orchestrates the entire game.
  class Game {
    constructor() {
      this.container = document.getElementById("game-container");
      if (!this.container) {
        console.error("Missing game container");
        return;
      }

      // Get all the UI elements
      this.scoreEl = document.getElementById("score");
      this.healthEl = document.getElementById("health");
      this.finalScoreEl = document.getElementById("finalScore");
      this.overlay = document.getElementById("game-over");
      this.restartBtn = document.getElementById("restartBtn");
      this.playerNameEl = document.getElementById("playerName");

      // Pause menu elements
      this.pauseBtn = document.getElementById("pauseBtn");
      this.pauseMenu = document.getElementById("pause-menu");
      this.resumeBtn = document.getElementById("resumeBtn");
      this.restartPauseBtn = document.getElementById("restartPauseBtn");
      this.highScoreText = document.getElementById("highScoreText");

      this.sound = new Sound();

      // Game state variables
      this.bg = null;
      this.player = null;
      this.bullets = [];
      this.enemies = [];
      this.score = 0;
      this.keys = {};
      this.spawnMs = 900;
      this.lastSpawn = 0;
      this.running = false;
      this.isPaused = false;
      this._bind();
    }

    // Sets up all event listeners for the game.
    _bind() {
      window.addEventListener("keydown", (e) => {
        this.keys[e.key] = true;
        if (e.key === " " || e.key === "Spacebar") e.preventDefault();
        // Toggle pause on Escape key press
        if (e.key === "Escape") this.isPaused ? this.resume() : this.pause();
      });
      window.addEventListener("keyup", (e) => {
        this.keys[e.key] = false;
      });
      if (this.restartBtn)
        this.restartBtn.addEventListener("click", () => this.restart());
      this.container.addEventListener("click", () => {
        if (!this.bg) this.bg = this.sound.ambience();
      });
      window.addEventListener("resize", () => {
        if (this.player) {
          this.player.x = Math.min(
            this.player.x,
            this.container.clientWidth - this.player.w
          );
          this.player.render();
        }
      });

      // Pause button bindings
      if (this.pauseBtn)
        this.pauseBtn.addEventListener("click", () => this.pause());
      if (this.resumeBtn)
        this.resumeBtn.addEventListener("click", () => this.resume());
      if (this.restartPauseBtn)
        this.restartPauseBtn.addEventListener("click", () => {
          this.resume();
          this.restart();
        });
    }

    // Pauses the game.
    pause() {
      if (!this.running || this.isPaused) return;
      this.isPaused = true;
      this.pauseMenu.classList.remove("hidden");
      this.container.removeAttribute("tabindex"); // Disable game input when paused
      this._updatePauseMenuUI();
    }

    // Resumes the game from a paused state.
    resume() {
      if (!this.isPaused) return;
      this.isPaused = false;
      this.pauseMenu.classList.add("hidden");
      this.container.focus(); // Re-enable game input
      this.lastTime = performance.now(); // Reset time to prevent huge delta after pause
      this.lastSpawn = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // Updates the high score display in the pause menu.
    _updatePauseMenuUI() {
      const current = localStorage.getItem("currentUser");
      if (current) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const me = users.find((u) => u.email === current);
        const highscore = (me && me.highscore) || 0;
        if (this.highScoreText) this.highScoreText.textContent = highscore;
      } else {
        if (this.highScoreText) this.highScoreText.textContent = 0;
      }
    }

    // Initializes the game.
    init() {
      const current = localStorage.getItem("currentUser");
      // Only start the game if a user is logged in
      if (current) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const me = users.find((u) => u.email === current);
        if (me && this.playerNameEl)
          this.playerNameEl.textContent = me.name || me.email;
        this.player = new Player(this.container, this.sound);
        this.player.render();
        this.score = 0;
        this.player.health = 5;
        this._updateUI();
        this.running = true;
        this.isPaused = false; // Ensure not paused initially
        this.lastTime = performance.now();
        this.lastSpawn = performance.now();
        requestAnimationFrame((t) => this.loop(t));
      } else {
        window.location.href = "register.html";
      }
    }

    // The main game loop, runs every frame.
    loop(ts) {
      if (!this.running || this.isPaused) return;

      // Handle player input
      if (this.keys["ArrowLeft"] || this.keys["a"]) this.player.move(-1);
      if (this.keys["ArrowRight"] || this.keys["d"]) this.player.move(1);
      if (this.keys[" "] || this.keys["Spacebar"]) {
        const b = this.player.shoot();
        if (b) this.bullets.push(b);
      }
      // Update bullet positions
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        const bottom = parseFloat(b.style.bottom || "0");
        b.style.bottom = bottom + 14 + "px";
        if (bottom > this.container.clientHeight) {
          try {
            b.remove();
          } catch (e) {}
          this.bullets.splice(i, 1);
        }
      }
      // Spawn new enemies periodically
      if (performance.now() - this.lastSpawn > this.spawnMs) {
        this.spawn();
        this.lastSpawn = performance.now();
      }
      // Update enemy positions and check for collisions with the player
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const en = this.enemies[i];
        en.update();
        const enRect = en.el.getBoundingClientRect();
        const pRect = this.player.el.getBoundingClientRect();
        // Check collision with player
        if (coll(enRect, pRect)) {
          this.sound.explosion();
          en.destroy();
          this.enemies.splice(i, 1);
          this.player.health -= 1;
          this._updateUI();
          if (this.player.health <= 0) {
            this._gameOver();
            return;
          }
          // Check if enemy went off-screen
        } else if (
          parseFloat(en.el.style.top) >
          this.container.clientHeight - 20
        ) {
          en.destroy();
          this.enemies.splice(i, 1);
          this.player.health -= 1;
          this._updateUI();
          if (this.player.health <= 0) {
            this._gameOver();
            return;
          }
        }
      }
      // Check for bullet collisions with enemies
      for (let b = this.bullets.length - 1; b >= 0; b--) {
        const bullet = this.bullets[b];
        const bRect = bullet.getBoundingClientRect();
        for (let e = this.enemies.length - 1; e >= 0; e--) {
          const enemy = this.enemies[e];
          const eRect = enemy.el.getBoundingClientRect();
          if (coll(bRect, eRect)) {
            this.sound.explosion();
            this._particles(enemy.el);
            this.score += enemy.score;
            enemy.destroy();
            this.enemies.splice(e, 1);
            try {
              bullet.remove();
            } catch (e) {}
            this.bullets.splice(b, 1);
            this._updateUI();
            break;
          }
        }
      }
      // Update player on screen
      this.player.render();
      requestAnimationFrame((t) => this.loop(t));
    }

    // Creates a new enemy of a random type.
    spawn() {
      const r = Math.random();
      let type = "alien";
      if (r < 0.6) type = "alien";
      else if (r < 0.9) type = "ufo";
      else type = "spacejet";
      const x =
        Math.floor(Math.random() * (this.container.clientWidth - 80)) + 10;
      const en = new Enemy(this.container, type, x);
      this.enemies.push(en);
    }

    // Updates the score and health display.
    _updateUI() {
      if (this.scoreEl) this.scoreEl.textContent = this.score;
      if (this.healthEl) this.healthEl.textContent = this.player.health;
    }
    // Creates explosion particles when an enemy is destroyed.
    _particles(el) {
      const x = parseFloat(el.style.left || "0");
      const y = parseFloat(el.style.top || "0");
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = x + Math.random() * 30 + "px";
        p.style.top = y + Math.random() * 20 + "px";
        p.style.background = ["#ffcc00", "#ff6b6b", "#7cff6b"][
          Math.floor(Math.random() * 3)
        ];
        p.style.width = "6px";
        p.style.height = "6px";
        p.style.position = "absolute";
        this.container.appendChild(p);
        setTimeout(() => {
          try {
            p.remove();
          } catch (e) {}
        }, 500 + Math.random() * 600);
      }
    }

    // Handles the game over sequence.
    _gameOver() {
      this.running = false;
      this.isPaused = false; // Ensure pause menu doesn't interfere
      this.pauseMenu.classList.add("hidden"); // Hide pause menu if it was shown
      if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
      if (this.overlay) this.overlay.classList.remove("hidden");
      const current = localStorage.getItem("currentUser");
      // If a user is logged in, save their score
      if (current) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const me = users.find((u) => u.email === current);
        if (me) {
          if (!me.highscore || this.score > me.highscore) {
            me.highscore = this.score;
            localStorage.setItem("users", JSON.stringify(users));
          }
        }
        // Update the main leaderboard
        let lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
        const idx = lb.findIndex((x) => x.email === current);
        if (idx !== -1) {
          if (this.score > lb[idx].score) lb[idx].score = this.score;
        } else {
          lb.push({
            name: (me && me.name) || current,
            email: current,
            score: this.score,
          });
        }
        lb.sort((a, b) => b.score - a.score);
        localStorage.setItem("leaderboard", JSON.stringify(lb.slice(0, 50)));
      }
    }

    // Restarts the game from the beginning.
    restart() {
      // Clear all existing enemies, bullets, and particles
      [
        ...this.container.querySelectorAll(".bullet"),
        ...this.container.querySelectorAll(".enemy"),
        ...this.container.querySelectorAll(".particle"),
      ].forEach((n) => {
        try {
          n.remove();
        } catch (e) {}
      });
      this.bullets = [];
      this.enemies = [];
      this.score = 0;
      this.player.health = 5;
      if (this.overlay) this.overlay.classList.add("hidden");
      this.pauseMenu.classList.add("hidden"); // Ensure pause menu is hidden
      this.isPaused = false; // Reset pause state
      this._updateUI();
      this.running = true;
      this.lastFrame = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  // Start the game when the page has loaded.
  window.addEventListener("load", () => {
    if (document.getElementById("game-container")) {
      window.game = new Game();
      window.game.init();
    }
  });
})();
