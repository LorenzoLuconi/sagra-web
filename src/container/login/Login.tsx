import {Button, Container, Paper, TextField} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import {sagraFetch} from "../../api/sagra/sagraFetcher.ts";
import {CourseCreateError, CourseCreateVariables} from "../../api/sagra/sagraComponents.ts";
import {useMutation} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {useAuth} from "../../context/AuthProvider.tsx";
import {useLocation, useNavigate} from "react-router";

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
    const location = useLocation();
    const search = new URLSearchParams(location.search);
    const redirect = search.get('redirect') ?? '/'
    const {setToken} = useAuth()
    const navigate = useNavigate()
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
        >({url: "/auth/token", method: "post", ...variables, signal});

    const loginPost = useMutation({
        mutationFn: () => {
            return fetchLogin({body: {username: username, password: password}});
        },
        onSuccess: (data, variables, context) => {
            console.log('Login Data: ', data)
            setToken(data.token)
            toast.success(`Login effettuato con successo`);
            navigate(`${redirect}`)
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return (
        <Container sx={{alignItems: "center"}}>
            <Paper elevation={2} sx={{width: "300px", display: "flex", flexDirection: "column", gap: 2, p: 3}}>
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
export default Login