import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Colleges } from "./pages/Colleges";
import { CollegeDetail } from "./pages/CollegeDetail";
import { Community } from "./pages/Community";
import { NewPost } from "./pages/NewPost";
import { PostDetail } from "./pages/PostDetail";
import { Admin } from "./pages/Admin";
import { Profile } from "./pages/Profile";
import { Compare } from "./pages/Compare";
import { Bookmarks } from "./pages/Bookmarks";
import { JEEPredictor } from "./pages/JEEPredictor";
import { AdminCMS } from "./pages/AdminCMS";
import { Analytics } from "./pages/Analytics";
import { CSVImport } from "./pages/CSVImport";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { AdminColleges } from "./pages/AdminColleges";
import { AdminBlog } from "./pages/AdminBlog";
import { AuthCallback } from "./components/AuthCallback";
import { CompleteProfile } from "./pages/CompleteProfile";
import { AdminUsers } from "./pages/AdminUsers";
import { Counseling } from "./pages/Counseling";
import { CounselingSuccess } from "./pages/CounselingSuccess";
import { AdminBookings } from "./pages/AdminBookings";
import { AdminLeads } from "./pages/AdminLeads";

function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/collages" element={<Navigate to="/colleges" replace />} />
          <Route path="/colleges/:id" element={<CollegeDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/new" element={<NewPost />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/cms" element={<AdminCMS />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/import" element={<CSVImport />} />
          <Route path="/admin/colleges" element={<AdminColleges />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/predictor" element={<JEEPredictor />} />
          <Route path="/counseling" element={<Counseling />} />
          <Route path="/counseling/success" element={<CounselingSuccess />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
