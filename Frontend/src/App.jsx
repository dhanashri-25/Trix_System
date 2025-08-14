import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/Navbar";
import Homepage from "./pages/HomePage";
import Buy from "./pages/Buy";
import Play from "./pages/Play";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/play" element={<Play />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "white",
                color: "#374151",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                fontSize: "14px",
                fontWeight: "500"
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "white",
                },
                style: {
                  border: "1px solid #D1FAE5",
                  background: "#F0FDF4"
                }
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "white",
                },
                style: {
                  border: "1px solid #FECACA",
                  background: "#FEF2F2"
                }
              },
            }}
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
