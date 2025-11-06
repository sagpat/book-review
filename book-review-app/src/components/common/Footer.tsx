import React from "react"
import {
    Box,
    Typography
  } from '@mui/material';


function Footer() {
    return (
      <Box
        sx={{
          mt: 5,
          backgroundColor: '#f5f5f5',
          padding: '20px',
          boxSizing: 'border-box',
          marginRight: 'calc(-50vw + 50%)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Online Book Store Publications.
        </Typography>
      </Box>
    );
  }

  export default Footer;