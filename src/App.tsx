import * as React from 'react'
import MainLayout from "./layout/MainLayout.tsx";
import Header from "./layout/Header.tsx";
import {createBrowserRouter, Navigate, Outlet, RouteObject, RouterProvider, useRouteError} from "react-router-dom";
import Products from "./container/Products.tsx";
import Orders from "./container/Orders.tsx";
import DepartmentsContainer from "./container/Departments.tsx";
import {Toaster} from "react-hot-toast";
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {ThumbDown} from "@mui/icons-material";
import {CircularProgress} from "@mui/material";

/*

    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute inset-0 size-full">
        <div className="relative h-full w-full select-none">
          <img
            className="absolute right-0 min-w-dvh dark:hidden"
            alt="Pattern Light"
            src="/pattern-light.svg"
          />
          <img
            className="absolute right-0 hidden min-w-dvh dark:block"
            alt="Pattern Dark"
            src="/pattern-dark.svg"
          />
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>

      <div className="relative flex w-full max-w-5xl flex-col items-center justify-center gap-12">
        <div className="relative flex flex-col items-center gap-6">
          <h1 className="relative text-center text-4xl leading-[125%] font-bold text-gray-900 dark:text-gray-200">
           <Departments />
          </h1>
        </div>
      </div>
    </main>

 */

/*
{
    path: '/',
        element: <MainLayout header={<Header/>} footer={<span>Footer</span>} body={<Outlet/>}/>,
    errorElement: <MainLayout header={<Header/>} footer={<span>Footer</span>} body={<Outlet/>}/>,
    children: [
    {
        index: true,
        element: <Navigate to={'/home'}/>
    }
]
}
*/


const useRouter = () => {


    return (
        createBrowserRouter([
            {
                path: "/",
                element: (
                    <MainLayout header={<Header/>} body={<Outlet/>} footer={<div>footer</div>}/>
                ),
                errorElement: <span>Error</span>,
                children: [
                    {
                        index: true,
                        element: <Navigate to={'/home'}/>
                    },
                    {
                        path: '/home',
                        element: <span>Home</span>
                    },
                    {
                        path: '/products',
                        element: <Products/>
                    },
                    {
                        path: '/orders',
                        element: <Orders/>
                    },
                    {
                        path: '/orders/new',
                        element: <span>NUOVO ORDINE</span>
                    },
                    {
                      path: '/departments',
                      element: <DepartmentsContainer/>
                    },
/*
                    {
                        path: '/product/:id',
                        element: <Product/>
                    },

 */
                    /*

                    {
                        path: '/orders/:id',
                        element: <Order/>
                    },

                    {
                        path: '/departments/:id',
                        element: <Departments/>
                    },
                    {
                        path: '/courses',
                        element: <Courses/>
                    },
                    {
                        path: '/courses/:id',
                        element: <Course/>
                    }
*/
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
                      }
                  },
                  success: {
                      icon: <ThumbUpIcon/>,
                      style: {
                          fontWeight: 700,
                          maxWidth: '95vw',
                          backgroundColor: 'green',
                          color: 'white'
                      },
                  },
                  error: {
                      icon: <ThumbDownIcon/>,
                      style: {
                          fontWeight: 700,
                          width: '100%'
                      },
                  },


              }}
          />
        <RouterProvider router={router}/>
      </React.Suspense>
  )
}
