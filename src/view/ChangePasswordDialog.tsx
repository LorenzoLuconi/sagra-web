import * as React from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
import {useChangePassword} from "../api/sagra/sagraComponents.ts";
import toast from "react-hot-toast";

interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
}

const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "payload" in error) {
        const payload = (error as {payload?: unknown}).payload;
        if (payload && typeof payload === "object" && "message" in payload) {
            const message = (payload as {message?: unknown}).message;
            if (typeof message === "string" && message.length > 0) {
                return message;
            }
        }
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as {message?: unknown}).message;
        if (typeof message === "string" && message.length > 0) {
            return message;
        }
    }

    return "Impossibile modificare la password";
};

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({open, onClose}) => {
    const changePassword = useChangePassword({
        onSuccess: () => {
            toast.success("Password aggiornata");
            handleClose();
        },
    });

    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const passwordsDoNotMatch =
        confirmPassword.length > 0 && newPassword !== confirmPassword;
    const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;

    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        changePassword.reset();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (passwordsDoNotMatch) {
            return;
        }

        changePassword.mutate({
            body: {
                currentPassword,
                newPassword,
            },
        });
    };

    return (
        <Dialog open={open} onClose={changePassword.isPending ? undefined : handleClose} fullWidth maxWidth="xs">
            <Stack component="form" onSubmit={handleSubmit}>
                <DialogTitle>Modifica password</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{pt: 1}}>
                        {changePassword.error && (
                            <Alert severity="error">{getErrorMessage(changePassword.error)}</Alert>
                        )}
                        <TextField
                            label="Password attuale"
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                            fullWidth
                            disabled={changePassword.isPending}
                        />
                        <TextField
                            label="Nuova password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                            fullWidth
                            error={passwordTooShort}
                            helperText={passwordTooShort ? "La password deve contenere almeno 8 caratteri" : " "}
                            disabled={changePassword.isPending}
                        />
                        <TextField
                            label="Conferma nuova password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                            fullWidth
                            error={passwordsDoNotMatch}
                            helperText={passwordsDoNotMatch ? "Le password non coincidono" : " "}
                            disabled={changePassword.isPending}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button onClick={handleClose} disabled={changePassword.isPending}>
                        Annulla
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            changePassword.isPending ||
                            currentPassword.length === 0 ||
                            newPassword.length === 0 ||
                            confirmPassword.length === 0 ||
                            passwordTooShort ||
                            passwordsDoNotMatch
                        }
                    >
                        Salva
                    </Button>
                </DialogActions>
            </Stack>
        </Dialog>
    );
};

export default ChangePasswordDialog;
