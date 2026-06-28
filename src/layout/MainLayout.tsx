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

        <Box sx={{ backgroundColor: 'background.default', height: '100%', m: 1, minWidth: 0 }}>
            {props.header}
            <Box sx={{ height: '100%', m: { xs: '12px 0', sm: '20px 10px' }, minWidth: 0 }}>
                {props.body}
            </Box>
        </Box>


        </ThemeProvider>
    )

}

export default MainLayout
