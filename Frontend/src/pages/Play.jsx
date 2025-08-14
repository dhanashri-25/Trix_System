import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import toast from "react-hot-toast";
import axios from "axios";
import io from "socket.io-client";

const Play = () => {
  const { account, balances, joinMatch, createMatch, loading } = useWeb3();
  const [activeTab, setActiveTab] = useState("create");
  const [stakeAmount, setStakeAmount] = useState("");
  const [availableMatches, setAvailableMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(""));
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [gameResult, setGameResult] = useState(null);
  const [socket, setSocket] = useState(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (account) {
      const newSocket = io("https://trix-system.onrender.com");
      setSocket(newSocket);

      // Join user-specific room for notifications
      newSocket.emit("joinUserRoom", account);

      // Listen for match events
      newSocket.on("matchJoined", (data) => {
        console.log("Match joined:", data);
        if (data.player1 === account.toLowerCase()) {
          // Someone joined your match
          toast.success("Player joined your match!");
          setCurrentMatch(data);
          setPlayerSymbol("X"); // Creator is X
          setIsPlayerTurn(true); // X goes first
          setGameBoard(Array(9).fill(""));
          setWaitingForOpponent(false);
          setGameResult(null);
        }
      });

      // Listen for move updates
      newSocket.on("moveUpdate", (data) => {
        console.log("Move update received:", data);
        setGameBoard(data.board);
        setCurrentMatch((prev) => ({
          ...prev,
          ...data,
        }));

        // Update turn status
        if (data.currentPlayer === account.toLowerCase()) {
          setIsPlayerTurn(true);
        } else {
          setIsPlayerTurn(false);
        }

        // Handle game end
        if (data.gameState === "finished" || data.gameState === "tie") {
          if (data.winner === account.toLowerCase()) {
            setGameResult("win");
            toast.success("🎉 You won the game!");
          } else if (data.winner && data.winner !== account.toLowerCase()) {
            setGameResult("lose");
            toast.error("😞 You lost the game!");
          } else {
            setGameResult("tie");
            toast.info("🤝 Game ended in a tie!");
          }
          setIsPlayerTurn(false);
        }
      });

      // Listen for opponent moves
      newSocket.on("opponentMove", (data) => {
        console.log("Opponent move:", data);
        setGameBoard(data.board);
        setIsPlayerTurn(data.player !== account.toLowerCase());
      });

      // Listen for game end
      newSocket.on("gameEnded", (data) => {
        console.log("Game ended:", data);
        if (data.winner === account.toLowerCase()) {
          setGameResult("win");
          toast.success("🎉 You won!");
        } else if (data.winner && data.winner !== account.toLowerCase()) {
          setGameResult("lose");
          toast.error("😞 You lost!");
        } else {
          setGameResult("tie");
          toast.info("🤝 It's a tie!");
        }
        setGameBoard(data.finalBoard);
        setIsPlayerTurn(false);
      });

      // Listen for match cancellations
      newSocket.on("matchCancelled", (data) => {
        toast.info("Match was cancelled");
        setCurrentMatch(null);
        setWaitingForOpponent(false);
        resetGameState();
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [account]);

  // Fetch available matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(
          "https://trix-system.onrender.com/api/matches/available"
        );
        setAvailableMatches(
          response.data.filter((match) => match.player1 !== account)
        );
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    if (account && !currentMatch && !waitingForOpponent) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 5000);
      return () => clearInterval(interval);
    }
  }, [account, currentMatch, waitingForOpponent]);

  const resetGameState = () => {
    setGameBoard(Array(9).fill(""));
    setIsPlayerTurn(false);
    setPlayerSymbol("");
    setGameResult(null);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }
    if (parseFloat(balances.gt) < parseFloat(stakeAmount)) {
      toast.error("Insufficient GT balance");
      return;
    }

    try {
      const matchId = await createMatch(stakeAmount);
      if (matchId) {
        toast.success("Match created! Waiting for opponent...");
        setStakeAmount("");
        setWaitingForOpponent(true);
        // Join the match room for real-time updates
        if (socket) {
          socket.emit("joinMatch", matchId);
        }
      }
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  const handleJoinMatch = async (match) => {
    try {
      await joinMatch(match.matchId, match.stakeAmount);
      // Join the match room
      if (socket) {
        socket.emit("joinMatch", match.matchId);
      }

      // Update backend about joining
      const response = await axios.post(
        "https://trix-system.onrender.com/api/matches/join",
        {
          matchId: match.matchId,
          player2: account,
        }
      );

      if (response.data) {
        setCurrentMatch({
          ...match,
          player2: account,
          status: "active",
        });
        setPlayerSymbol("O"); // Joiner is O
        setIsPlayerTurn(false); // X (creator) goes first
        setGameBoard(Array(9).fill(""));
        setGameResult(null);
        toast.success("Joined match successfully!");
      }
    } catch (error) {
      console.error("Error joining match:", error);
      toast.error("Failed to join match");
    }
  };

  const handleCellClick = async (index) => {
    if (
      !currentMatch ||
      gameBoard[index] !== "" ||
      !isPlayerTurn ||
      gameResult
    ) {
      return;
    }

    const newBoard = [...gameBoard];
    newBoard[index] = playerSymbol;
    setGameBoard(newBoard);
    setIsPlayerTurn(false);

    try {
      // Send move to backend
      const response = await axios.post(
        "https://trix-system.onrender.com/api/game/move",
        {
          matchId: currentMatch.matchId,
          player: account,
          position: index,
          board: newBoard,
        }
      );

      if (response.data.success) {
        // Update local state with server response
        setGameBoard(response.data.board);
        if (
          response.data.gameState === "finished" ||
          response.data.gameState === "tie"
        ) {
          if (response.data.winner === account.toLowerCase()) {
            setGameResult("win");
            toast.success("🎉 You won!");
          } else if (
            response.data.winner &&
            response.data.winner !== account.toLowerCase()
          ) {
            setGameResult("lose");
            toast.error("😞 You lost!");
          } else {
            setGameResult("tie");
            toast.info("🤝 It's a tie!");
          }
          setIsPlayerTurn(false);
        }

        // Emit move via socket for real-time update
        if (socket) {
          socket.emit("makeMove", {
            matchId: currentMatch.matchId,
            player: account,
            position: index,
            board: response.data.board,
          });
        }
      }
    } catch (error) {
      console.error("Error making move:", error);
      toast.error("Failed to make move");
      // Revert the move
      setGameBoard(gameBoard);
      setIsPlayerTurn(true);
    }
  };

  const handleCancelWait = async () => {
    try {
      // Cancel the waiting match
      setWaitingForOpponent(false);
      toast.info("Cancelled waiting for opponent");
    } catch (error) {
      console.error("Error cancelling match:", error);
    }
  };

  const GameCell = ({ index, value }) => (
    <button
      onClick={() => handleCellClick(index)}
      disabled={!currentMatch || value !== "" || !isPlayerTurn || gameResult}
      className={`w-20 h-20 border-2 border-gray-300 bg-white rounded-lg shadow-sm
                 flex items-center justify-center text-3xl font-bold transition-all duration-200
                 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed ${
                   value === "X" ? "text-blue-600" : "text-purple-600"
                 } ${gameResult ? "opacity-75" : ""}`}
    >
      {value}
    </button>
  );

  const formatTokenAmount = (amount) => {
    const formatted = parseFloat(amount) / Math.pow(10, 18);
    return formatted;
  };

  const MatchCard = ({ match, onJoin }) => {
    const stakeInTokens = formatTokenAmount(match.stakeAmount);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-900 font-semibold">
              Stake: {stakeInTokens.toFixed(2)} GT
            </p>
            <p className="text-gray-500 text-sm">
              Player: {match.player1.slice(0, 6)}...{match.player1.slice(-4)}
            </p>
          </div>
          <div className="text-2xl">🎯</div>
        </div>
        <button
          onClick={() => onJoin(match)}
          disabled={loading || parseFloat(balances.gt) < stakeInTokens}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                     text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 
                     transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {parseFloat(balances.gt) < stakeInTokens
            ? "Insufficient GT"
            : "Join Match"}
        </button>
      </div>
    );
  };

  // Waiting for opponent screen
  if (waitingForOpponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 shadow-lg">
          <div className="animate-spin text-6xl mb-6">⏳</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Waiting for Opponent
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your match has been created. Waiting for someone to join...
          </p>
          <div className="animate-pulse text-2xl mb-6">🎯</div>
          <button
            onClick={handleCancelWait}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                       text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 
                       transform hover:scale-105 shadow-sm"
          >
            Cancel Wait
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 shadow-lg">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please connect your wallet to play games
          </p>
        </div>
      </div>
    );
  }

  if (parseFloat(balances.gt) === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 shadow-lg">
          <div className="text-6xl mb-6">💰</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            No GT Tokens
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            You need GT tokens to play games
          </p>
          <a
            href="/buy"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                       text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-200 
                       transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Buy GT Tokens
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Play{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tic Tac Toe
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Stake GT tokens and win big!
          </p>
          <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-gray-200 shadow-sm">
            <span className="text-emerald-600 font-semibold">
              Your GT Balance: {parseFloat(balances.gt).toFixed(2)}
            </span>
          </div>
        </div>

        {currentMatch ? (
          /* Game Board */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Match In Progress
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Stake:{" "}
                  {formatTokenAmount(currentMatch.stakeAmount).toFixed(2)} GT
                  each
                </p>
                <p className="text-gray-600">
                  You are:{" "}
                  <span
                    className={
                      playerSymbol === "X" ? "text-blue-600" : "text-purple-600"
                    }
                  >
                    {playerSymbol}
                  </span>
                </p>
                {gameResult ? (
                  <div className="mt-4">
                    {gameResult === "win" && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <p className="text-emerald-700 text-xl font-bold">
                          🎉 You Won!
                        </p>
                        <p className="text-emerald-600">
                          You earned{" "}
                          {(
                            formatTokenAmount(currentMatch.stakeAmount) * 2
                          ).toFixed(2)}{" "}
                          GT
                        </p>
                      </div>
                    )}
                    {gameResult === "lose" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-xl font-bold">
                          😞 You Lost!
                        </p>
                        <p className="text-red-600">Better luck next time!</p>
                      </div>
                    )}
                    {gameResult === "tie" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 text-xl font-bold">
                          🤝 It's a Tie!
                        </p>
                        <p className="text-yellow-600">
                          Stakes have been returned
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    className={
                      isPlayerTurn ? "text-emerald-600" : "text-orange-600"
                    }
                  >
                    {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
                {gameBoard.map((cell, index) => (
                  <GameCell key={index} index={index} value={cell} />
                ))}
              </div>

              <div className="text-center">
                {gameResult ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setCurrentMatch(null);
                        resetGameState();
                        setWaitingForOpponent(false);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                                 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 
                                 transform hover:scale-105 shadow-sm mr-4"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => {
                        setCurrentMatch(null);
                        resetGameState();
                        setWaitingForOpponent(false);
                      }}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 
                                 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 
                                 transform hover:scale-105 shadow-sm"
                    >
                      Back to Lobby
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentMatch(null);
                      resetGameState();
                      setWaitingForOpponent(false);
                      if (socket) {
                        socket.emit("leaveMatch", currentMatch.matchId);
                      }
                    }}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                               text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 
                               transform hover:scale-105 shadow-sm"
                  >
                    Leave Game
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Match Selection */
          <div>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-2 flex shadow-sm">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === "create"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Create Match
                </button>
                <button
                  onClick={() => setActiveTab("join")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === "join"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Join Match
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "create" ? (
              /* Create Match Tab */
              <div className="max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
                  <div className="text-center mb-8">
                    <div className="text-4xl mb-4">⚔️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Create New Match
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Set your stake and wait for an opponent
                    </p>
                  </div>
                  <form onSubmit={handleCreateMatch} className="space-y-6">
                    <div>
                      <label className="block text-gray-900 font-semibold mb-2">
                        Stake Amount (GT)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Enter stake amount"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 
                                   placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Available: {parseFloat(balances.gt).toFixed(2)} GT
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={
                        loading || !stakeAmount || parseFloat(stakeAmount) <= 0
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                                 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 
                                 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        "Create Match"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Join Match Tab */
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">🎲</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Available Matches
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Choose a match to join and start playing
                  </p>
                </div>
                {availableMatches.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Available Matches
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Be the first to create a match!
                    </p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                                 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 
                                 transform hover:scale-105 shadow-sm"
                    >
                      Create Match
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableMatches.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        onJoin={handleJoinMatch}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
