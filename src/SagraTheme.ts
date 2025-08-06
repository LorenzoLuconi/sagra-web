import {createTheme} from '@mui/material/styles';
import {Theme} from "@mui/material";

declare module '@mui/material/styles' {
    interface Theme {
        sagra: {
            productAlmostSoldOut: string;
            productSoldOut: string;
            productCard: string;
            panelBackground: string;
        };
    }
    // allow configuration using `createTheme()`
    interface ThemeOptions {
        sagra: {
            productAlmostSoldOut?: string;
            productSoldOut?: string;
            productCard?: string;
            panelBackground?: string;
        };
    }
}

const lightTheme: Theme = createTheme({
    sagra: {
        productAlmostSoldOut: 'hsla(48, 100%, 88%, 0.5)',
        productSoldOut: 'hsla(17, 100%, 88%, 0.5)',
        productCard: '#fff',
        panelBackground: '#f5f5f5'
    },
    palette: {
        mode: 'light',
        background: {
        }
    }
})
const darkTheme = createTheme({
    sagra: {
        // FIXME da rivedere
        productAlmostSoldOut: 'hsla(48, 100%, 62.37%, 0.5)',
        productSoldOut: 'hsla(17, 100%, 60%, 0.5)',
        productCard: '#fff',
        panelBackground: '#f8f8f8'
    },
    palette: {
        mode: 'dark',
        background: {
            paper: '#181818',
            default: '#181818',
        }
    },
});
export const sagraTheme: Record<string, Theme> = {
    'light': lightTheme,
    'dark': darkTheme
}

