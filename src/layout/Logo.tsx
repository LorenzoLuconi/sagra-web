import {Box} from "@mui/material";
import type {SvgIconProps} from "@mui/material";
import {useAppConfiguration} from "../context/AppConfigurationStore.tsx";

const svgToDataUrl = (value: string): string => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
};

export const Logo = (props: SvgIconProps) => {
    const {logoSvg} = useAppConfiguration();
    const {sx} = props;

    if (logoSvg) {
        return (
            <Box
                component="img"
                alt="Logo"
                src={svgToDataUrl(logoSvg)}
                sx={[
                    {
                        width: "1em",
                        height: "1em",
                        objectFit: "contain",
                        verticalAlign: "middle",
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            />
        );
    }

    return <></>
}
