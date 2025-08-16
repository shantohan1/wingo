# 🎲 Wingo Helper (Educational Tool)

This project is for **educational & responsible play awareness** only.  
It does **NOT** predict future results. It logs past rounds, shows EV, and explains randomness.

## Features
- ✅ Store round results in MySQL
- ✅ EV Calculator
- ✅ Risk Simulator (Monte Carlo)
- ✅ ChatGPT explanation (no prediction)

## Setup
1. Clone repo
2. Install deps
   ```bash
   npm install
   ```
3. Create `.env`
   ```
   OPENAI_API_KEY=sk-xxxxxx
   ```
4. Import DB
   ```bash
   mysql -u root -p msd < db.sql
   ```
5. Run server
   ```bash
   npm start
   ```
6. Open `index.html` in browser

⚠️ **Important**: Do not upload your `.env` to GitHub.
