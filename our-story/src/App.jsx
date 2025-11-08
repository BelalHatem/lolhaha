import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/navbar.jsx";
import OurStory from "./component/ourstory.jsx";
import Diary from "./component/diary.jsx";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<OurStory />} />
        <Route path="/ourstory" element={<OurStory />} />
        <Route path="/diary" element={<Diary />} />
      </Routes>
    </Router>
  );
}
