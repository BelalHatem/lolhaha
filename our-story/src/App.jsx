import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/navbar.jsx";
import OurStory from "./component/ourstory.jsx";

export default function App() {
  return (
    <Router>
      {/* Navbar stays fixed at top */}
      <Navbar />

      {/* Page routes */}
      <Routes>
        <Route path="/" element={<OurStory />} />
        <Route path="/ourstory" element={<OurStory />} />
      </Routes>
    </Router>
  );
}
