OVERVIEW

Crypto Crash is a backend system for an online multiplayer "Crash" game where players place bets in USD, converted to cryptocurrency (BTC/ETH), and attempt to cash out before a game-defined multiplier crashes. This project involves real-time game logic, cryptocurrency integration with live price fetching, and real-time updates via WebSockets.

Live Demo - https://crypto-crash-game.vercel.app/

🧩 Tech Stack

Node.js with Express.js

MongoDB (NoSQL database)

Socket.IO (WebSockets)

CoinGecko API (for real-time crypto prices)

Crypto module (for provably fair crash point generation)

🚀 Setup Instructions

1. Prerequisites
Node.js & npm

MongoDB

Internet access for CoinGecko API

2. Installation
   
bash
Copy
Edit

# Clone the repository
git clone <REPO_URL>
cd crypto-crash-backend

# Install dependencies
npm install

# Start development server
npm run dev

3. Environment Variables
Create a .env file in the root directory:

env
Copy
Edit
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crypto_crash
🔒 No API key required for CoinGecko

🔧 Features

1. Game Logic
New game every 10 seconds

Multiplier increases exponentially

Provably fair crash point generation

Player bets in USD (converted to crypto)

Real-time cashouts before crash

Game state saved in MongoDB

2. Crypto Integration
   
Real-time price fetching from CoinGecko

Wallet simulation in BTC/ETH

USD <-> Crypto conversion

Simulated blockchain transactions with logs

3. WebSockets
   
Real-time multiplier updates (every 100ms)

Broadcast events:

Round start

Multiplier change

Player cashout

Crash point reveal

Cashout requests sent via WebSocket

🧮 API Documentation

POST /api/bet
Place a bet in USD.

Request:
json
Copy
Edit
{
  "player_id": "player123",
  "usd_amount": 10,
  "currency": "BTC"
}
Response:
json
Copy
Edit
{
  "message": "Bet placed",
  "crypto_amount": 0.000167,
  "round_id": "ROUND_123"
}
POST /api/cashout
Cash out before crash.

Request:
json
Copy
Edit
{
  "player_id": "player123",
  "round_id": "ROUND_123"
}
Response:
json
Copy
Edit
{
  "message": "Cashout successful",
  "usd_payout": 20,
  "crypto_payout": 0.000333
}
GET /api/wallet/:player_id
Get player wallet.

Response:
json
Copy
Edit
{
  "BTC": {
    "balance": 0.002,
    "usd_equivalent": 120
  },
  "ETH": {
    "balance": 0.05,
    "usd_equivalent": 90
  }
}
🔌 WebSocket Events
Client → Server
Event	Payload	Description
cashout	{ player_id, round_id }	Request to cash out

Server → Client
Event	Payload	Description
round_start	{ round_id, seed_hash }	New round begins
multiplier	{ multiplier }	Multiplier update (100ms)
cashout	{ player_id, usd, crypto, multiplier }	Player cashed out
crash	{ crash_point }	Game round crashed

🔐 Provably Fair Crash Algorithm

How It Works

A secret seed is generated at round start.

Hash of the seed + round number is stored (e.g., SHA256(seed + round_number)).

Crash point = derived from hashed value, e.g.:

ts
Copy
Edit
const hash = SHA256(seed + roundNumber);
const num = parseInt(hash.slice(0, 13), 16);
const crashPoint = Math.max(1.0, Math.floor(100000 / (num % 100 + 1)) / 100);
seed revealed after crash for transparency.

💸 USD-Crypto Conversion

Prices fetched via CoinGecko API.

Cached for 10 seconds to prevent rate limit issues.

Example conversion:

ruby
Copy
Edit
$10 bet in BTC when BTC = $60,000
=> 10 / 60000 = 0.00016667 BTC

Cashed out at 2x:
=> 0.00016667 * 2 = 0.00033334 BTC
=> $20 (0.00033334 * 60000)

🧾 Transaction Logs

Stored in transactions collection:

json
Copy
Edit
{
  "player_id": "player123",
  "usd_amount": 10,
  "crypto_amount": 0.00016667,
  "currency": "BTC",
  "transaction_type": "bet",
  "transaction_hash": "MOCK_HASH_123",
  "price_at_time": 60000,
  "timestamp": "2025-05-06T12:34:56Z"
}

🧪 Testing

Sample Data Script
Run:

bash
Copy
Edit
npm run seed
Adds sample wallets for 3–5 players

Pre-populates a few game rounds

Postman Collection
Located at: docs/postman_collection.json

WebSocket Client
Simple HTML client at: client/index.html

🧠 Architectural Notes

Game Engine uses setInterval to trigger rounds every 10s.

WebSocket Gateway broadcasts game events.

CryptoService handles pricing, conversion, and mock transactions.

Atomic DB Updates ensure wallet safety.

Fairness is verifiable via seed reveal + hash.

✅ Future Improvements

Frontend UI for gameplay (optional bonus)

JWT-based authentication

Admin dashboard to review rounds

Redis for better caching & performance

Rate limiter middleware for API endpoints

📎 Submission

Push to Git repo (GitHub/GitLab)

Include:

Postman collection

Sample data script

Simple WebSocket client

🔒 License

This project is for educational and evaluation purposes only. Do not use with real cryptocurrency or financial systems.

