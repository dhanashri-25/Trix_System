import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import toast from "react-hot-toast";

const Buy = () => {
  const { account, balances, mintUSDT, buyGT, loading } = useWeb3();
  const [usdtAmount, setUsdtAmount] = useState("");
  const [gtAmount, setGtAmount] = useState("");

  const handleMintUSDT = async (e) => {
    e.preventDefault();
    if (!usdtAmount || parseFloat(usdtAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await mintUSDT(usdtAmount);
    setUsdtAmount("");
  };

  const handleBuyGT = async (e) => {
    e.preventDefault();
    if (!gtAmount || parseFloat(gtAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(balances.usdt) < parseFloat(gtAmount)) {
      toast.error("Insufficient USDT balance");
      return;
    }
    await buyGT(gtAmount);
    setGtAmount("");
  };

  const StepCard = ({ number, title, description, completed }) => (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
        completed
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
          completed ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-200 max-w-md mx-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please connect your wallet to buy tokens
          </p>
          <div className="text-6xl mb-4">🔗</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Buy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tokens
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Get USDT and GT tokens to start playing
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Your Current Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-xl text-center text-white shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-2">💵</div>
              <h3 className="text-lg font-semibold text-white">USDT Balance</h3>
              <p className="text-2xl font-bold text-white">
                {parseFloat(balances.usdt).toFixed(2)} USDT
              </p>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-xl text-center text-white shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="text-lg font-semibold text-white">GT Balance</h3>
              <p className="text-2xl font-bold text-white">
                {parseFloat(balances.gt).toFixed(2)} GT
              </p>
            </div>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title="Mint USDT"
              description="Get test USDT tokens for free"
              completed={parseFloat(balances.usdt) > 0}
            />
            <StepCard
              number="2"
              title="Buy GT Tokens"
              description="Exchange USDT for GT at 1:1 ratio"
              completed={parseFloat(balances.gt) > 0}
            />
            <StepCard
              number="3"
              title="Start Playing"
              description="Use GT tokens to stake in matches"
              completed={parseFloat(balances.gt) > 0}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mint USDT Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💵</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mint USDT
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Get free test USDT tokens (Sepolia network)
              </p>
            </div>

            <form onSubmit={handleMintUSDT} className="space-y-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  USDT Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                    placeholder="Enter USDT amount"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 
                             placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 font-medium">
                    USDT
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Network:</span>
                  <span className="text-emerald-600 font-medium">
                    Sepolia Testnet
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Cost:</span>
                  <span className="text-emerald-600 font-medium">
                    Free (Test tokens)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !usdtAmount}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 
                         text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 
                         transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Minting...</span>
                  </div>
                ) : (
                  "Mint USDT Tokens"
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm leading-relaxed">
                💡 <strong>Tip:</strong> This mints test USDT tokens on Sepolia
                testnet. You can mint as many as you need for testing.
              </p>
            </div>
          </div>

          {/* Buy GT Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Buy GT Tokens
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Exchange USDT for GT tokens (1:1 ratio)
              </p>
            </div>

            <form onSubmit={handleBuyGT} className="space-y-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2">
                  USDT to Spend
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balances.usdt}
                    value={gtAmount}
                    onChange={(e) => setGtAmount(e.target.value)}
                    placeholder="Enter USDT amount to spend"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 
                             placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 font-medium">
                    USDT
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Available: {parseFloat(balances.usdt).toFixed(2)} USDT
                  </span>
                  <button
                    type="button"
                    onClick={() => setGtAmount(balances.usdt)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Use Max
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Exchange Rate:</span>
                  <span className="text-emerald-600 font-medium">
                    1 USDT = 1 GT
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>You will receive:</span>
                  <span className="text-emerald-600 font-medium">
                    {gtAmount ? parseFloat(gtAmount).toFixed(2) : "0"} GT
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Network Fee:</span>
                  <span className="text-emerald-600 font-medium">Gas only</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !gtAmount ||
                  parseFloat(balances.usdt) < parseFloat(gtAmount || 0)
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
                         text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 
                         transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Buying...</span>
                  </div>
                ) : (
                  "Buy GT Tokens"
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-emerald-800 text-sm leading-relaxed">
                🎯 <strong>Game Tokens:</strong> GT tokens are used to stake in
                matches. Win games to earn more GT tokens!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {parseFloat(balances.gt) > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 You're Ready to Play!
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You have{" "}
                <span className="text-emerald-600 font-bold">
                  {parseFloat(balances.gt).toFixed(2)} GT
                </span>{" "}
                tokens. Start playing matches now!
              </p>
              <a
                href="/play"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                         text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-200 
                         transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Playing 🎮
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;
