
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

// Crypto options
const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin" },
  { value: "ETH", label: "Ethereum" },
];

// Mock crypto prices
const CRYPTO_PRICES = {
  BTC: 60000,
  ETH: 3500,
};

// Game states
enum GameState {
  WAITING = "waiting",
  RUNNING = "running",
  CRASHED = "crashed",
}

const CrashGame = () => {
  // WebSocket connection
  const ws = useRef<WebSocket | null>(null);
  
  // User state
  const [balance, setBalance] = useState(1000); // Starting with $1000
  const [betAmount, setBetAmount] = useState(10);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [hasBet, setHasBet] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState(0);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [currentPlayers, setCurrentPlayers] = useState<{ id: string, amount: number, crypto: string }[]>([]);
  const [gameHistory, setGameHistory] = useState<{ crashPoint: number, timestamp: Date }[]>([]);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Simulated WebSocket behavior
    const simulateWebSocket = () => {
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            startGame();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(countdownInterval);
      };
    };
    
    const simulationCleanup = simulateWebSocket();
    
    return () => {
      simulationCleanup();
    };
  }, []);
  
  // Start a new game round
  const startGame = () => {
    setGameState(GameState.RUNNING);
    setMultiplier(1);
    
    // Generate random crash point between 1 and 10
    const crashPoint = 1 + Math.random() * 9;
    console.log(`This round will crash at ${crashPoint.toFixed(2)}x`);
    
    // Start multiplier increase
    const interval = setInterval(() => {
      setMultiplier(prev => {
        const growth = 0.05;
        const newMultiplier = prev + (prev * growth * 0.1);
        
        // Check if game should crash
        if (newMultiplier >= crashPoint) {
          clearInterval(interval);
          gameOver(crashPoint);
          return crashPoint;
        }
        
        return newMultiplier;
      });
    }, 100);
    
    return () => clearInterval(interval);
  };
  
  // Game over function
  const gameOver = (crashPoint: number) => {
    setGameState(GameState.CRASHED);
    
    // If player didn't cash out, they lose their bet
    if (hasBet) {
      toast({
        title: "Game Over!",
        description: `Game crashed at ${crashPoint.toFixed(2)}x. You lost your bet of $${betAmount}.`,
        variant: "destructive",
      });
      setHasBet(false);
    }
    
    // Add to game history
    setGameHistory(prev => [{ crashPoint, timestamp: new Date() }, ...prev.slice(0, 9)]);
    
    // Restart game after 3 seconds
    setTimeout(() => {
      setGameState(GameState.WAITING);
    }, 3000);
  };
  
  // Place bet function
  const placeBet = () => {
    if (balance < betAmount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance to place this bet.",
        variant: "destructive",
      });
      return;
    }
    
    if (gameState !== GameState.WAITING) {
      toast({
        title: "Cannot place bet",
        description: "You can only place bets before the round starts.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate crypto amount based on current price
    const cryptoPrice = CRYPTO_PRICES[selectedCrypto as keyof typeof CRYPTO_PRICES];
    const cryptoAmt = betAmount / cryptoPrice;
    
    // Update state
    setBalance(prev => prev - betAmount);
    setCryptoAmount(cryptoAmt);
    setHasBet(true);
    
    // Add player to current players list (simulating multiplayer)
    setCurrentPlayers(prev => [
      ...prev,
      {
        id: `player_${Math.floor(Math.random() * 1000)}`,
        amount: betAmount,
        crypto: selectedCrypto
      }
    ]);
    
    toast({
      title: "Bet placed!",
      description: `You bet $${betAmount} (${cryptoAmt.toFixed(8)} ${selectedCrypto})`,
    });
  };
  
  // Cash out function
  const cashOut = () => {
    if (!hasBet || gameState !== GameState.RUNNING) {
      return;
    }
    
    // Calculate winnings
    const winnings = betAmount * multiplier;
    
    // Update balance
    setBalance(prev => prev + winnings);
    setHasBet(false);
    
    toast({
      title: "Cash Out Successful!",
      description: `You won $${winnings.toFixed(2)} at ${multiplier.toFixed(2)}x!`,
    });
    
    // Remove from current players
    setCurrentPlayers(prev => 
      prev.filter(player => player.id !== `player_${Math.floor(Math.random() * 1000)}`)
    );
  };
  
  // Color based on multiplier
  const getMultiplierColor = () => {
    if (multiplier < 1.5) return "text-white";
    if (multiplier < 2) return "text-yellow-400";
    if (multiplier < 3) return "text-orange-400";
    if (multiplier < 5) return "text-red-500";
    return "text-purple-500";
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Crypto Crash</h1>
          <p className="text-gray-400">Place bets, watch the multiplier grow, cash out before it crashes!</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Game Round</span>
                  {gameState === GameState.WAITING && (
                    <span className="text-amber-400">Next round in {countdown}s</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-16">
                {gameState === GameState.RUNNING && (
                  <div className="text-center">
                    <div className={`text-8xl font-bold mb-6 ${getMultiplierColor()}`}>
                      {multiplier.toFixed(2)}x
                    </div>
                    {hasBet && (
                      <Button 
                        size="lg" 
                        onClick={cashOut} 
                        className="bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
                      >
                        CASH OUT (${(betAmount * multiplier).toFixed(2)})
                      </Button>
                    )}
                  </div>
                )}
                
                {gameState === GameState.CRASHED && (
                  <div className="text-center">
                    <div className="text-8xl font-bold text-red-500 mb-6">
                      CRASHED AT {multiplier.toFixed(2)}x
                    </div>
                  </div>
                )}
                
                {gameState === GameState.WAITING && (
                  <div className="text-center w-full">
                    <div className="text-4xl font-bold mb-6">
                      Place Your Bets
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        min="1"
                        className="bg-gray-700"
                      />
                      
                      <Select
                        value={selectedCrypto}
                        onValueChange={setSelectedCrypto}
                      >
                        <SelectTrigger className="w-full md:w-[180px] bg-gray-700">
                          <SelectValue placeholder="Select Crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRYPTO_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={placeBet} 
                        className="bg-gradient-to-r from-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800"
                      >
                        Place Bet
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Active Players */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle>Active Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentPlayers.length === 0 ? (
                    <p className="text-gray-400">No active players in this round</p>
                  ) : (
                    currentPlayers.map((player, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                        <div>Player {player.id}</div>
                        <div className="text-amber-400">${player.amount} ({player.crypto})</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
                {hasBet && (
                  <Alert className="mt-4 bg-blue-900/50 border-blue-700">
                    <AlertDescription>
                      You have an active bet of ${betAmount} ({cryptoAmount.toFixed(8)} {selectedCrypto})
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="text-xs text-gray-400">
                Crypto prices: BTC ${CRYPTO_PRICES.BTC} | ETH ${CRYPTO_PRICES.ETH}
              </CardFooter>
            </Card>
            
            {/* Game History */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Recent Crashes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameHistory.length === 0 ? (
                    <p className="text-gray-400">No recent games</p>
                  ) : (
                    gameHistory.map((game, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-gray-400">
                          {game.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={
                          game.crashPoint < 1.5 ? "text-red-400" : 
                          game.crashPoint < 3 ? "text-yellow-400" : 
                          "text-green-400"
                        }>
                          {game.crashPoint.toFixed(2)}x
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Game Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>How To Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Place a bet before the round starts</p>
                <p>2. Watch the multiplier increase</p>
                <p>3. Cash out before the game crashes to win</p>
                <p>4. If you don't cash out before the crash, you lose your bet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
