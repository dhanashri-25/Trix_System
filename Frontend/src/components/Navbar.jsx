import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const Navbar = () => {
  const { account, balances, connectWallet, loading } = useWeb3();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-2xl">🎮</span>
              <span>TicTacToe DApp</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/buy"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/buy")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Buy Tokens
            </Link>
            <Link
              to="/play"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/play")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Play Game
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/leaderboard")
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Leaderboard
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-4">
                {/* Balance Display */}
                <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-amber-600 font-medium">
                      <span className="font-semibold">USDT:</span>{" "}
                      {parseFloat(balances.usdt).toFixed(2)}
                    </div>
                    <div className="text-emerald-600 font-medium">
                      <span className="font-semibold">GT:</span>{" "}
                      {parseFloat(balances.gt).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Account Address */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-2 text-white font-medium text-sm shadow-sm">
                  {truncateAddress(account)}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 
                         transform hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive("/")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Home
          </Link>
          <Link
            to="/buy"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive("/buy")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Buy Tokens
          </Link>
          <Link
            to="/play"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive("/play")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Play Game
          </Link>
          <Link
            to="/leaderboard"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive("/leaderboard")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;