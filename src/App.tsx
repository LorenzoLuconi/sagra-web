import * as React from 'react'
import MainLayout from "./layout/MainLayout.tsx";
import Header from "./layout/Header.tsx";
import {createBrowserRouter, Navigate, Outlet, RouteObject, RouterProvider} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {Box, CircularProgress, ThemeProvider} from "@mui/material";
import {Logo} from "./layout/Logo.tsx";
import {sagraTheme} from "./SagraTheme.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import 'dayjs/locale/it';
import {useLocalStorage} from "./utils";
import {useAuth} from "./context/AuthStore.tsx";
import LoginView from "./view/LoginView.tsx";

const UnmanagedPathView = React.lazy(() => import("./view/UnmanagedPathView.tsx"))
const MonitorContainer = React.lazy(() => import("./container/monitor/MonitorContainer.tsx"))
const OrderEdit = React.lazy(() => import('./container/order/OrderEdit.tsx'))
const DepartmentContainer = React.lazy(() => import("./container/department/DepartmentContainer.tsx"))
const DiscountContainer = React.lazy(() => import("./container/discount/DiscountContainer.tsx"))
const ProductContainer = React.lazy(() => import('./container/product/ProductContainer.tsx'))
const CourseContainer = React.lazy(() => import("./container/course/CourseContainer.tsx"))
const UserContainer = React.lazy(() => import("./container/user/UserContainer.tsx"))
const OrderNew = React.lazy(() => import("./container/order/OrderNew.tsx"))
const ProductQuantityUpdateContainer = React.lazy(() => import("./container/product/ProductQuantityUpdateContainer.tsx"))
const StatsContainer = React.lazy(() => import("./container/stats/StatsContainer.tsx"))
const OrderListContainer = React.lazy(() => import("./container/order/OrderListContainer.tsx"))
const MonitorView = React.lazy(() => import("./container/monitor/MonitorView.tsx"))

const AdminOnly = ({children}: React.PropsWithChildren): React.ReactElement => {
    const {user} = useAuth();

    if (user?.role !== "admin") {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};

const useRouter = () => {
    // Da spostare dove si può prendere valori derivanti dall'autenticazione
    const [theme, setTheme] = useLocalStorage(`sagraWeb:theme:genericUser`, 'light')


    return (
        createBrowserRouter([

            {
                path: '/monitors/:monitorId/view',
                element:  <ThemeProvider theme={sagraTheme[theme]}><MonitorView/></ThemeProvider>
            },
            {
                path: "/",
                element: (
                    <MainLayout theme={sagraTheme[theme]} header={<Header changeTheme={(theme: string) => {
                        setTheme(theme)
                    }}/>} body={<Outlet />} footer={<div>footer</div>}/>
                ),
                errorElement: <span>Error</span>,
                children: [
                    {
                        index: true,
                        element: <Navigate to={'/home'}/>
                    },
                    {
                        path: '/home',
                        element: (
                            <Box sx={{display: 'flex', justifyContent: 'center', height: '100%'}}>
                                <Logo sx={{fontSize: '50vh', color: 'text.primary'}}/>
                            </Box>
                        )
                    },
                    {
                        path: '/products',
                        element: <AdminOnly><ProductContainer/></AdminOnly>
                    },
                    {
                        path: '/products/updateQuantity',
                        element: <AdminOnly><ProductQuantityUpdateContainer/></AdminOnly>
                    },
                    {
                        path: '/orders',
                        element: <OrderListContainer/>
                    },
                    {
                        path: '/orders/new',
                        element: <OrderNew/>
                    },
                    {
                        path: '/orders/:orderId',
                        element: <OrderEdit/>
                    },

                    {
                        path: '/users',
                        element: <AdminOnly><UserContainer/></AdminOnly>
                    },
                    {
                        path: '/departments',
                        element: <AdminOnly><DepartmentContainer/></AdminOnly>
                    },
                    {
                        path: '/courses',
                        element: <AdminOnly><CourseContainer/></AdminOnly>
                    },
                    {
                        path: '/discounts',
                        element: <AdminOnly><DiscountContainer/></AdminOnly>
                    },
                    {
                        path: '/stats',
                        element: <AdminOnly><StatsContainer/></AdminOnly>
                    },
                    {
                        path: '/monitors',
                        element: <AdminOnly><MonitorContainer/></AdminOnly>
                    },
                    {
                        path: '*',
                        element: <UnmanagedPathView/>
                    }
                ]
            }
        ] as RouteObject[])
    )


}


export default function App() {

    const router = useRouter()
    const {status} = useAuth()

    return (
        <React.Suspense fallback={<CircularProgress/>}>
            <Toaster
                toastOptions={{
                    duration: 5000,
                    loading: {
                        icon: <InfoIcon/>,
                        style: {
                            fontWeight: 700,
                            fontFamily: 'Roboto'
                        }
                    },
                    success: {
                        icon: <ThumbUpIcon/>,
                        style: {
                            fontWeight: 700,
                            fontFamily: 'Roboto',
                            maxWidth: '95vw',
                            backgroundColor: 'green',
                            color: 'white'
                        },
                    },
                    error: {
                        icon: <ThumbDownIcon/>,
                        style: {
                            fontFamily: 'Roboto',
                            fontWeight: 700,
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            width: '100%'
                        },
                    },


                }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'it'}>
                {status === "authenticated" ? <RouterProvider router={router}/> : <LoginView/>}
            </LocalizationProvider>
        </React.Suspense>
    )
}
