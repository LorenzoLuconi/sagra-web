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

        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '500px', backgroundColor: 'background.default', justifyContent: 'space-between', height: '100vh', gap: '20px' }}>
            <Box sx={{ display: 'flex', margin: '0 8px'}}>{props.header}</Box>
            <Box sx={{ display: 'flex', margin: '0 10px', flexDirection: 'column', justifyContent: 'flex-start', height: '100%' }}>
                {props.body}
            </Box>
            {props.footer}
        </Box>


        </ThemeProvider>
    )

}

export default MainLayout
