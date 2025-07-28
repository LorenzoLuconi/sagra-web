import { Container, Paper, TextField, Button } from "@mui/material";
import { useState } from "react";
import * as React from "react";
import { sagraFetch } from "../api/sagra/sagraFetcher.ts";
import type * as Schemas from "../api/sagra/sagraSchemas.ts";
import { CourseCreateError, CourseCreateVariables, fetchOrderDelete } from "../api/sagra/sagraComponents.ts";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../main.tsx";
import toast from "react-hot-toast";


export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
};

const Login  = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleChangeUsername =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setUsername(event.currentTarget.value);
      }, [setUsername]
    );

  const handleChangePassword =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setPassword(event.currentTarget.value);
      }, [setPassword]
    );

  const fetchLogin = (
    variables: CourseCreateVariables,
    signal?: AbortSignal,
  ) =>
    sagraFetch<
      LoginResponse,
      CourseCreateError,
      LoginRequest,
      {},
      {},
      {}
    >({ url: "/auth/login", method: "post", ...variables, signal });

  const loginPost = useMutation({
    mutationFn: () => {
      return fetchLogin({ body: { username, password }});
    },
    onSuccess: () => {
      toast.success(`Login effettuato con successo`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Container sx={{ alignItems: "center"}}>
      <Paper elevation={2} sx={{ width: "300px", display: "flex",  flexDirection: "column", gap: 2, p: 3 }}>
        <TextField label="Username"
                   value={username}
                   onChange={handleChangeUsername}
                   fullWidth/>
        <TextField label="Password" type="password"
                   value={password}
                   onChange={handleChangePassword}
                   fullWidth/>
        <Button onClick={() => loginPost.mutate()}>Login</Button>
      </Paper>
    </Container>
  )
}

export default Login;