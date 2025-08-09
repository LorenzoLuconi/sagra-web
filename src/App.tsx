import * as React from 'react'
import MainLayout from "./layout/MainLayout.tsx";
import Header from "./layout/Header.tsx";
import {createBrowserRouter, Navigate, Outlet, RouteObject, RouterProvider} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {Box, CircularProgress, ThemeProvider} from "@mui/material";
//import UnmanagedPathView from "./view/UnmanagedPathView.tsx";
//import MonitorContainer from "./container/monitor/MonitorContainer.tsx";
import {Logo} from "./layout/Logo.tsx";
//import OrderEdit from "./container/order/OrderEdit.tsx";
//import DepartmentContainer from "./container/department/DeparmentContainer.tsx";
//import CourseContainer from "./container/course/CourseContainer.tsx";
//import DiscountContainer from "./container/discount/DiscountContainer.tsx";
//import ProductContainer from "./container/product/ProductContainer.tsx";
//import OrderNew from "./container/order/OrderNew.tsx";
//import ProductQuantityUpdateContainer from "./container/product/ProductQuantityUpdateContainer.tsx";
//import StatsContainer from "./container/stats/StatsContainer.tsx";
import {sagraTheme} from "./SagraTheme.ts";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import 'dayjs/locale/it';
import AuthProvider, {ProtectedComponent} from "./context/AuthProvider.tsx";
import Login from './container/login/Login.tsx'
import Logout from './container/login/Logout.tsx'
import {useLocalStorage} from "./utils";

const UnmanagedPathView = React.lazy(() => import("./view/UnmanagedPathView.tsx"))
const MonitorContainer = React.lazy(() => import("./container/monitor/MonitorContainer.tsx"))
const OrderEdit = React.lazy(() => import('./container/order/OrderEdit.tsx'))
const DepartmentContainer = React.lazy(() => import("./container/department/DeparmentContainer.tsx"))
const ProductContainer = React.lazy(() => import('./container/product/ProductContainer.tsx'))
const DiscountContainer = React.lazy(()=> import('./container/department/DeparmentContainer.tsx'))
const CourseContainer = React.lazy(() => import("./container/course/CourseContainer.tsx"))
const OrderNew = React.lazy(() => import("./container/order/OrderNew.tsx"))
const ProductQuantityUpdateContainer = React.lazy(() => import("./container/product/ProductQuantityUpdateContainer.tsx"))
const StatsContainer = React.lazy(() => import("./container/stats/StatsContainer.tsx"))
const OrderListContainer = React.lazy(() => import("./container/order/OrderListContainer.tsx"))
const MonitorView = React.lazy(() => import("./container/monitor/MonitorView.tsx"))


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
              path: '/login',
              element: <Login/>
            },
            {
                path: '/logout',
                element: <Logout/>
            },
            {
                path: "/",
                element: (
                    <MainLayout
                        theme={sagraTheme[theme]}
                        header={
                            <Header changeTheme={(theme: string) => {
                                setTheme(theme)
                                }}
                            />
                        }
                        body={<ProtectedComponent><Outlet/></ProtectedComponent>}
                        footer={<div>footer</div>}/>
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
                        element: <ProductContainer/>
                    },
                    {
                        path: '/products/updateQuantity',
                        element: <ProductQuantityUpdateContainer/>
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
                        path: '/departments',
                        element: <DepartmentContainer/>
                    },
                    {
                        path: '/courses',
                        element: <CourseContainer/>
                    },
                    {
                        path: '/discounts',
                        element: <DiscountContainer/>
                    },
                    {
                        path: '/stats',
                        element: <StatsContainer/>
                    },
                    {
                        path: '/monitors',
                        element: <MonitorContainer/>
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
                <AuthProvider>
                    <RouterProvider router={router}/>
                </AuthProvider>
            </LocalizationProvider>
        </React.Suspense>
    )
}
