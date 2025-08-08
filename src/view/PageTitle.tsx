import { SvgIconComponent } from "@mui/icons-material";
import {Box, Typography} from "@mui/material";

interface PageTitleProps {
    title: string;
    icon: React.ReactElement<SvgIconComponent> ;
}
const PageTitle : React.FC<PageTitleProps> = (props) => {
    const {title, icon} = props;
    return (
        <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: "center", gap: 1, m: 1}}>
            {icon}
        <Typography sx={{fontWeight: 700, fontSize: "1.5em"}}>
            {title}
        </Typography>
    </Box>
    )
};

export default PageTitle;