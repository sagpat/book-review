import React, { useContext } from "react";
import {
  Box,
  Button,
  Typography,
  Toolbar,
  AppBar,
  styled,
} from "@mui/material";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useNavigate } from "react-router-dom";
import UserReviews from "../user/UserReviews";
import NotificationCenter from "../notifications/NotificationCenter";

const StickyAppBar = styled(AppBar)(() => ({
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  position: "fixed",
}));

function Header() {
  const userId = localStorage.getItem("userId");
  const role = useAppSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const handleLogin = () => {
    // bug to fix: not navigating to main page from inner pages.
    navigate("/", { replace: true });
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  const handleUserReviews = () => {
    navigate("/users-reviews", { replace: true });
  };

  const handleBookCreation = () => {
    navigate("/create-book", { replace: true });
  };

  const handleRecommendations = () => {
    navigate("/recommendations", { replace: true });
  };

  const handleAnalytics = () => {
    navigate("/analytics", { replace: true });
  };

  const handleSearch = () => {
    navigate("/search", { replace: true });
  };

  return (
    <StickyAppBar>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "-webkit-fill-available",
        }}
      >
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Typography variant="h5">Welcome to Books' Library</Typography>
        </Box>
        
        {userId && <Button color="inherit" onClick={handleSearch}>
          Search
        </Button>}
        
        {userId && <Button color="inherit" onClick={handleRecommendations}>
          Recommendations
        </Button>}
        
        {role === 'admin' && <Button color="inherit" onClick={handleAnalytics}>
          Analytics
        </Button>}
        
        {role === 'admin' && <Button color="inherit" onClick={handleBookCreation}>
          Book Management
        </Button>}
        
       {userId && <Button color="inherit" onClick={handleUserReviews}>
          My Reviews
        </Button>}

        {userId && <NotificationCenter />}

        {userId && <Button color="inherit" onClick={handleLogin}>
          Logout
        </Button>}
      </Toolbar>
    </StickyAppBar>
  );
}

export default Header;
