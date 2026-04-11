import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {Logo} from "../layout/Logo.tsx";
import {AppConf} from "../AppConf.ts";
import {useAuth} from "../context/AuthStore.tsx";

const LoginView = (): React.ReactElement => {
    const {login, status, errorMessage, isLoginPending} = useAuth();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const disabled = isLoginPending || status === "loading";

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await login({
            username: username.trim(),
            password,
        });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background: "linear-gradient(180deg, #f5f5f5 0%, #e3f2fd 100%)",
            }}
        >
            <Card sx={{width: "100%", maxWidth: 420, boxShadow: 6}}>
                <CardContent sx={{p: 4}}>
                    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                        <Stack spacing={1} alignItems="center">
                            <Logo sx={{fontSize: "4rem", color: "text.primary"}} />
                            <Typography variant="h5" fontWeight={700}>
                                {AppConf.getTitle()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                Inserisci username e password per aprire l&apos;applicazione.
                            </Typography>
                        </Stack>

                        {status === "unauthenticated" && errorMessage && (
                            <Alert severity="error">{errorMessage}</Alert>
                        )}

                        <TextField
                            label="Username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            autoFocus
                            required
                            fullWidth
                            disabled={disabled}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                            fullWidth
                            disabled={disabled}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={isLoginPending ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
                            disabled={disabled || username.trim().length === 0 || password.length === 0}
                        >
                            Accedi
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginView;
