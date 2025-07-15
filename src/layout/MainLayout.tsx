import * as React from 'react'
import {Box} from "@mui/material";

interface MainLayoutI {
    header: React.ReactElement
    body: React.JSX.Element
    footer: React.JSX.Element
}

const MainLayout: React.FC<MainLayoutI> = (props) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100vh', gap: '20px' }}>
            {props.header}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%' }}>
                {props.body}
            </Box>
            {props.footer}
        </Box>
    )

}

export default MainLayout
