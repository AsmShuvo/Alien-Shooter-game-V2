Alien Shooter
=========================================

Contents:
- register.html, game.html, leaderboard.html
- style.css (bright theme for forms, navbar, leaderboard)
- js/assets.js (embedded SVG images)
- js/auth.js (register/login with name & phone)
- js/game.js (final working game with images, sounds, bullets, collisions)
- js/leaderboard.js (displays top scores)
- README.txt (this file)

How to run:
1. Extract the ZIP.
2. Open register.html in Chrome or Edge (recommended).
3. Register (name, phone, email, password) and click Register & Play.
4. Controls: Left/Right or A/D to move; Space to shoot; click inside the game area once to enable sound.
5. On Game Over your best score will be saved to the leaderboard (localStorage).


Project Description
=========================================

This project is a complete web-based game, "Alien Shooter," featuring a full user authentication system and a leaderboard. All data is stored locally in the browser's localStorage.

Game Functionality
------------------
The game is a top-down shooter where the player controls a spaceship at the bottom of the screen.
- **Controls:** The player can move left and right using the 'A'/'D' keys or the Arrow keys. The Spacebar is used to shoot projectiles.
- **Gameplay:** Enemies of different types spawn at the top and move downwards. The player must shoot them to score points.
- **Health System:** The player starts with a set amount of health. Health is lost if an enemy collides with the player's ship or if an enemy reaches the bottom of the screen. The game ends when health reaches zero.
- **Pause/Resume:** The game can be paused at any time by clicking the pause button or pressing the 'Escape' key. This opens a menu with options to resume, restart, or return to the main menu.

User Authentication
-------------------
- **Registration:** New users can create an account via the registration form. After successful registration, the user is automatically taken to the login tab to sign in.
- **Login:** Registered users can log in to play. A successful login redirects the user to the game page. The system ensures that only logged-in users can access the game.
- **Data Storage:** All user account information (name, phone, email, password, and high score) is stored in the browser's `localStorage` in JSON format.

Rankings (Leaderboard)
----------------------
- **Score Saving:** When a logged-in player finishes a game, their final score is automatically saved. The system checks if the new score is higher than their previous personal best and updates it if necessary.
- **Display:** The "Leaderboard" page fetches all user scores from `localStorage`, sorts them in descending order, and displays a ranked list of the top players, showing their rank, name, email, and high score.
