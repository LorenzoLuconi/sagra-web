import * as React from 'react'
import MainLayout from "./layout/MainLayout.tsx";
import Header from "./layout/Header.tsx";
import {createBrowserRouter, Navigate, Outlet, RouteObject, RouterProvider} from "react-router-dom";
import Orders from "./container/order/Orders.tsx";
import {Toaster} from "react-hot-toast";
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {Box, CircularProgress, createTheme, Theme} from "@mui/material";
import UnmanagedPathView from "./view/UnmanagedPathView.tsx";
import MonitorContainer from "./container/MonitorContainer.tsx";
import {Logo} from "./layout/Logo.tsx";
import Monitors from "./container/Monitors.tsx";
import OrderEdit from "./container/order/OrderEdit.tsx";
import DepartmentContainer from "./container/department/DeparmentContainer.tsx";
import CourseContainer from "./container/course/CourseContainer.tsx";
import DiscountContainer from "./container/discount/DiscountContainer.tsx";
import ProductContainer from "./container/product/ProductContainer.tsx";
import OrderNew from "./container/order/OrderNew.tsx";
import {OrderStore} from "./context/OrderStore.tsx";
import ProductQuantityUpdateContainer from "./container/product/ProductQuantityUpdateContainer.tsx";
import OrderPrint from "./container/order/OrderPrint.tsx";


const lightTheme: Theme = createTheme({
    palette: {
        mode: 'light',
        background: {
            paper: '#f5f5f5',
            default: '#fff'
        }
    }
})
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            paper: '#181818',
            default: '#181818'
        }
    },
});
const sagraTheme: Record<string, Theme> = {
    'light': lightTheme,
    'dark': darkTheme
}



const useRouter = () => {
    const [currentTheme, setCurrentTheme] = React.useState('light')

    return (
        createBrowserRouter([
            {
                path: '/monitors/:id',
                element: <MonitorContainer/>
            },
            {
                path: "/",
                element: (
                    <MainLayout theme={sagraTheme[currentTheme]} header={<Header changeTheme={(theme: string) => {setCurrentTheme(theme)}}/>} body={<Outlet/>} footer={<div>footer</div>}/>
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
                        element: <Orders/>
                    },
                    {
                        path: '/orders/new',
                        element:  <OrderStore products={[]}><OrderNew/></OrderStore>
                    },
                    {
                      path: '/orders/:orderId',
                        element: <OrderEdit/>
                    },

                  {
                    path: '/orders/:orderId/print',
                    element: <OrderPrint />
                  },
                    {
                      path: '/departments',
                      element: <DepartmentContainer/>
                    },
                    {
                        path: '/monitors',
                        element: <Monitors/>
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
                          fontFamily: 'Roboto',
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
                          fontFamily: 'Roboto',
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          width: '100%'
                      },
                  },


              }}
          />
        <RouterProvider router={router}/>
      </React.Suspense>
  )
}
