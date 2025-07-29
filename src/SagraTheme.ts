import {createTheme} from '@mui/material/styles';
import {Theme} from "@mui/material";

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            productAlmostSoldOut: string;
            productSoldOut: string;
        };
    }
    // allow configuration using `createTheme()`
    interface ThemeOptions {
        status?: {
            productAlmostSoldOut?: string;
            productSoldOut?: string;
        };
    }
}

const lightTheme: Theme = createTheme({
    palette: {
        mode: 'light',
        status: {
            productAlmostSoldOut: 'hsla(48, 100%, 88%, 0.5)',
            productSoldOut: 'hsla(17, 100%, 88%, 0.5)',
        },
        background: {
            paper: '#F8F8F8',
            default: '#fff',
            productCard: '#fff',

        }
    }
})
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        status: {
            productAlmostSoldOut: 'hsla(48, 100%, 62.37%, 0.5)',
            productSoldOut: 'hsla(17, 100%, 60%, 0.5)',
        },
        background: {
            paper: '#181818',
            default: '#181818',
            productCard: '#181818'
        }
    },
});
export const sagraTheme: Record<string, Theme> = {
    'light': lightTheme,
    'dark': darkTheme
}

