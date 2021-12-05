# Des Giffres et des Lettres

A website for the 2021 CentraleSupélec BDE campaigns. 

## 📖 Rules

The game is based on the french tv show _Des chiffres et des lettres_.

The point is to find a French word with 10 random letters.
If the word exists, the player scores points based on the length of the word.
Players points are then added in a global leaderboard.

## ⚙ Behind the scenes

I wanted to make a truly stateless server (for no particular reason) so I had to come up with an interesting solution.

Instead of using a cache, I used a system inspired by JWTs.

To stop the players from cheating I had to make sure that the letters where indeed randomly chosen by the server. To do that I signed the random letters using Fernet.

## 🐳 Tech stack

This website is built on my standard Dockerised Django setup.

## ⚖ Liscence

This code is provided under the MIT liscence

