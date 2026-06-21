import * as React from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {
    fetchDeleteUser,
    fetchUpdateUser,
    listUsersQuery,
} from "../../api/sagra/sagraComponents.ts";
import {User, UserUpdateRequest} from "../../api/sagra/sagraSchemas.ts";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {
    Check,
    Close,
    DeleteOutlined,
    EditOutlined,
    SettingsOutlined,
} from "@mui/icons-material";
import {queryClient} from "../../main.tsx";
import {green, red} from "@mui/material/colors";
import toast from "react-hot-toast";
import {manageError} from "../../utils";
import {ErrorWrapper} from "../../api/sagra/sagraFetcher.ts";
import {useAuth} from "../../context/AuthStore.tsx";
import {useConfirm} from "material-ui-confirm";

type UserEditState = {
    username: string;
    name: string;
    role: User["role"];
    password: string;
};

const initialEditState: UserEditState = {
    username: "",
    name: "",
    role: "cashier",
    password: "",
};

const UsersList = (): React.ReactElement => {
    const {user: authenticatedUser} = useAuth();
    const confirm = useConfirm();
    const [selected, setSelected] = React.useState<string | null>(null);
    const [editState, setEditState] = React.useState<UserEditState>(initialEditState);

    const resetState = () => {
        setSelected(null);
        setEditState(initialEditState);
    };

    const usersSearchConf = listUsersQuery({});
    const usersQuery = useQuery({
        queryKey: usersSearchConf.queryKey,
        queryFn: usersSearchConf.queryFn,
    });

    const userDelete = useMutation({
        mutationFn: (username: string) => {
            return fetchDeleteUser({
                pathParams: {username},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: usersSearchConf.queryKey}).then(() => {
                toast.success("Utente cancellato");
            });
        },
        onError: (error: Error) => {
            manageError(error as ErrorWrapper<unknown>);
        },
    });

    const userUpdate = useMutation({
        mutationFn: ({
            username,
            userRequest,
        }: {
            username: string;
            userRequest: UserUpdateRequest;
        }) => {
            return fetchUpdateUser({
                body: userRequest,
                pathParams: {username},
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: usersSearchConf.queryKey}).then(() => {
                toast.success("Utente modificato");
            });
        },
        onError: (error: Error) => {
            manageError(error as ErrorWrapper<unknown>);
        },
    });

    const handleFieldChange = (field: keyof UserEditState) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setEditState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditState((prev) => ({
            ...prev,
            role: event.target.value as User["role"],
        }));
    };

    const handleDelete = (listedUser: User) => {
        resetState();
        confirm({
            title: `Cancellazione utente '${listedUser.username}'`,
            description: "Vuoi procedere alla cancellazione dell'utente?",
        }).then((result) => {
            if (result.confirmed) {
                userDelete.mutate(listedUser.username);
            }
        });
    };

    if (usersQuery.isError) {
        return <Alert severity="error">Si è verificato un errore prelevando la lista utenti: {usersQuery.error.message}</Alert>;
    }

    if (usersQuery.isPending) {
        return (
            <Box sx={{alignItems: 'center', justifyItems: 'center', m: 2}}>
                <CircularProgress/>
            </Box>
        );
    }

    const users = usersQuery.data;
    const passwordTooShort = editState.password.length > 0 && editState.password.length < 8;

    if (!users || users.length < 1) {
        return <Typography>Nessun utente presente</Typography>;
    }

    return (
        <Table>
            <TableHead>
                <TableRow sx={{backgroundColor: "background.default"}}>
                    <TableCell>Username</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Ruolo</TableCell>
                    <TableCell>Password</TableCell>
                    <TableCell sx={{width: '100px'}} align="center"><SettingsOutlined /></TableCell>
                </TableRow>
            </TableHead>
            <TableBody sx={{backgroundColor: "background.default"}}>
                {users.map((listedUser: User) => {
                    const isEditing = selected === listedUser.username;
                    const isCurrentUser = authenticatedUser?.username === listedUser.username;

                    return (
                        <TableRow key={listedUser.username} selected={isEditing}>
                            <TableCell sx={{fontSize: '1.05em'}}>{listedUser.username}</TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        required
                                        size="small"
                                        value={editState.name}
                                        onChange={handleFieldChange("name")}
                                    />
                                ) : (
                                    listedUser.name
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        select
                                        size="small"
                                        value={editState.role}
                                        onChange={handleRoleChange}
                                        sx={{minWidth: 140}}
                                    >
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="cashier">Cassiere</MenuItem>
                                    </TextField>
                                ) : (
                                    listedUser.role === "admin" ? "Admin" : "Cassiere"
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditing ? (
                                    <TextField
                                        size="small"
                                        type="password"
                                        label="Nuova password"
                                        value={editState.password}
                                        onChange={handleFieldChange("password")}
                                        error={passwordTooShort}
                                        helperText={passwordTooShort ? "Minimo 8 caratteri" : " "}
                                    />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Non visibile
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                {isEditing ? (
                                    <>
                                        <IconButton
                                            aria-label="Salva modifica"
                                            onClick={() => {
                                                if (passwordTooShort) {
                                                    return;
                                                }
                                                const request: UserUpdateRequest = {
                                                    name: editState.name.trim(),
                                                    role: editState.role,
                                                    ...(editState.password.trim().length > 0 ? {password: editState.password} : {}),
                                                };
                                                userUpdate.mutate({
                                                    username: listedUser.username,
                                                    userRequest: request,
                                                });
                                                resetState();
                                            }}
                                        >
                                            <Check sx={{color: green[700]}} />
                                        </IconButton>
                                        <IconButton
                                            aria-label="Annulla modifica"
                                            onClick={resetState}
                                        >
                                            <Close sx={{color: red[700]}} />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            aria-label="edit"
                                            onClick={() => {
                                                setSelected(listedUser.username);
                                                setEditState({
                                                    username: listedUser.username,
                                                    name: listedUser.name,
                                                    role: listedUser.role,
                                                    password: "",
                                                });
                                            }}
                                        >
                                            <EditOutlined />
                                        </IconButton>
                                        <IconButton
                                            aria-label="delete"
                                            disabled={isCurrentUser}
                                            onClick={() => {
                                                handleDelete(listedUser);
                                            }}
                                        >
                                            <DeleteOutlined />
                                        </IconButton>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default UsersList;
