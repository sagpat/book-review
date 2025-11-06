import React, { useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import { Box } from "@mui/material";

const Layout = () => {
  return (
    <Box>
        <Header />
      <main>
        <Outlet />
      </main>
    </Box>
  );
};

export default Layout;
