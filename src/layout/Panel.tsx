import {Box} from "@mui/material";

export enum Position {
    top,
    middle,
    bottom
}

interface PanelProps  extends React.PropsWithChildren {
    position?: Position;
    sx: any
}

const record:Record<Position, string> = {
    [Position.top]: 'first',
    [Position.middle]: 'second',
    [Position.bottom]: 'second',
};

const Panel = ({ position, children }: PanelProps) => {

    return (
        <Box sx={...props.sx}>
            { position && record[position] }
            {children}
        </Box>
    )
}

export default Panel;