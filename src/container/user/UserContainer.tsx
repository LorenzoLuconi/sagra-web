import * as React from "react";
import {IconButton, Paper, useTheme} from "@mui/material";
import {CachedOutlined, PeopleOutlined} from "@mui/icons-material";
import PageTitle from "../../view/PageTitle.tsx";
import {listUsersQuery} from "../../api/sagra/sagraComponents.ts";
import {queryClient} from "../../main.tsx";
import toast from "react-hot-toast";
import {UserEdit} from "./UserEdit.tsx";
import UsersList from "./UsersList.tsx";

const UserContainer = (): React.ReactElement => {
    const theme = useTheme();

    const searchConf = listUsersQuery({});
    const handleRefresh = () => {
        queryClient.invalidateQueries({queryKey: searchConf.queryKey}).then(() => {
            toast.success("Elenco utenti aggiornato", {duration: 2000});
        }).catch((e: Error) => {
            console.log("Errore: ", e);
        });
    };

    return (
        <>
            <PageTitle title="Utenti" icon={<PeopleOutlined/>}/>

            <Paper
                variant="outlined"
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 2,
                    flexWrap: "wrap",
                    gap: 1,
                    backgroundColor: theme.sagra.panelBackground,
                }}
                className="paper-top"
            >
                <UserEdit/>
                <IconButton sx={{width: '40px'}}>
                    <CachedOutlined onClick={handleRefresh} />
                </IconButton>
            </Paper>

            <Paper
                variant="outlined"
                sx={{mt: 1, p: 2, backgroundColor: theme.sagra.panelBackground}}
                className="paper-bottom"
            >
                <UsersList/>
            </Paper>
        </>
    );
};

export default UserContainer;
