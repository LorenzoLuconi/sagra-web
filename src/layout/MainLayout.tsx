import * as React from 'react'
import {Box, Theme, ThemeProvider} from "@mui/material";

interface MainLayoutI {
    header: React.ReactElement
    body: React.JSX.Element
    footer: React.JSX.Element
    theme: Theme
}
// <Box sx={{padding: 2, paddingRight: 4, paddingLeft: 4, bgcolor: 'background.default', minWidth: '500px'}}>
const MainLayout: React.FC<MainLayoutI> = (props) => {
    return (

        <ThemeProvider theme={props.theme}>

        <Box sx={{ m: 1, minWidth: '600px', backgroundColor: 'background.default', height: '100%' }}>
            {props.header}
            <Box sx={{ margin: '20px 10px', height: '100%' }}>
                {props.body}
            </Box>
        </Box>


        </ThemeProvider>
    )

}

export default MainLayout
