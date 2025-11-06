import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { login, register } from "../../features/auth/authAPI";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { responseStatusCode } = useAppSelector((state) => state.auth);
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [apiError, setAPIError] = useState<string>("");
  const ROLE = "user";

  /* login controller */

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAPIError("");
    dispatch(login(name, password)); // Dispatch the login action
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAPIError("");
    dispatch(register(name, email, password, ROLE)); // Dispatch the registration action
  };

  useEffect(() => {
    setAPIError("");

    if (responseStatusCode !== null) {
      if (isLogin) {
        if (responseStatusCode !== 200 && responseStatusCode !== 201) {
          setAPIError("Invalid credentials. Please try again.");
        } else if (responseStatusCode !== 201) {
          navigate("/books");
        }
      } else if (!isLogin) {
        if (responseStatusCode !== 201) {
          setAPIError("Registration failed. Please try again.");
        } else {
          setIsLogin(!isLogin);
        }
      }
    }
  }, [responseStatusCode, isLogin, navigate]);

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" align="center">
          {isLogin ? "Login" : "Register"}
        </Typography>

        {apiError && <Typography color="error">{apiError}</Typography>}

        {responseStatusCode === 201 && (
          <Typography color="success">
            Registration Successful. <br /> Please login now with your
            credentials!
          </Typography>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {!isLogin && (
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button fullWidth variant="contained" color="primary" type="submit">
            {isLogin ? "Login" : "Register"}
          </Button>
        </form>

        {/* Toggle between login and register */}
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Button onClick={() => setIsLogin(!isLogin)}>
              {!isLogin
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Auth;
