import * as React from "react";
import {useMutation} from "@tanstack/react-query";
import {fetchCreateUser, listUsersQuery} from "../../api/sagra/sagraComponents.ts";
import {UserRequest} from "../../api/sagra/sagraSchemas.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import {Box, Button, MenuItem, SelectChangeEvent, TextField} from "@mui/material";
import {AddCircle} from "@mui/icons-material";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";

const emptyForm = {
    username: "",
    name: "",
    role: "cashier" as UserRequest["role"],
    password: "",
};

export const UserEdit = (): React.ReactElement => {
    const [formData, setFormData] = React.useState<UserRequest>(emptyForm);
    const usernameTooShort = formData.username.trim().length > 0 && formData.username.trim().length < 6;
    const passwordTooShort = formData.password.length > 0 && formData.password.length < 8;

    const userCreate = useMutation({
        mutationFn: (request: UserRequest) => {
            return fetchCreateUser({body: request});
        },
        onSuccess: (data) => {
            const usersSearchConf = listUsersQuery({});
            queryClient.invalidateQueries({queryKey: usersSearchConf.queryKey}).then(() => {
                toast.success(`Utente ${data.username} creato con successo`);
                setFormData(emptyForm);
            });
        },
        onError: (error: Error) => {
            manageError(error as ErrorWrapper<unknown>);
        },
    });

    const handleChange = (field: keyof UserRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRoleChange = (event: SelectChangeEvent<UserRequest["role"]>) => {
        setFormData((prev) => ({
            ...prev,
            role: event.target.value as UserRequest["role"],
        }));
    };

    const submitDisabled = React.useMemo(() => {
        return (
            formData.username.trim().length === 0 ||
            usernameTooShort ||
            formData.name.trim().length === 0 ||
            formData.password.trim().length === 0 ||
            passwordTooShort
        );
    }, [formData, passwordTooShort, usernameTooShort]);

    return (
        <Box sx={{display: "flex", alignItems: "start", gap: "20px", flexWrap: "wrap"}}>
            <TextField
                size="small"
                required
                label="Username"
                value={formData.username}
                onChange={handleChange("username")}
                error={usernameTooShort}
                helperText={usernameTooShort ? "Minimo 6 caratteri" : " "}
            />
            <TextField
                size="small"
                required
                label="Nome"
                value={formData.name}
                onChange={handleChange("name")}
            />
            <TextField
                select
                size="small"
                required
                label="Ruolo"
                value={formData.role}
                onChange={handleRoleChange}
                sx={{minWidth: 150}}
            >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="cashier">Cassiere</MenuItem>
            </TextField>
            <TextField
                size="small"
                required
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange("password")}
                error={passwordTooShort}
                helperText={passwordTooShort ? "Minimo 8 caratteri" : " "}
            />
            <Button
                variant="contained"
                startIcon={<AddCircle />}
                disabled={submitDisabled}
                onClick={() => {
                    userCreate.mutate({
                        username: formData.username.trim(),
                        name: formData.name.trim(),
                        role: formData.role,
                        password: formData.password,
                    });
                }}
            >
                Crea Utente
            </Button>
        </Box>
    );
};
