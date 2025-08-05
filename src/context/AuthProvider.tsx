import * as React from 'react'
import {useLocation, useNavigate} from "react-router";

interface AuthContextI {
    token?: string
    setToken: (token: string | undefined) => void
}
export const AuthContext = React.createContext<AuthContextI>({
    token: undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setToken: (token?: string) => {}
})

const AuthProvider: React.FC<React.PropsWithChildren> = (props) => {
    const { children} = props
    const [storedToken, setStoredToken] = React.useState<string|undefined>(undefined)

    const setTokenHandler = (t: string | undefined) => {
        globalThis.token = t
        setStoredToken(t)
    }


    return (
        <AuthContext.Provider
            value={{
                token: storedToken,
                setToken: setTokenHandler
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider


export const useAuth = () => {
    const authContext = React.useContext(AuthContext)
    return {token: authContext.token, setToken: authContext.setToken}
}

export const ProtectedComponent: React.FC<React.PropsWithChildren> = (props) => {
    const navigate = useNavigate()
    const {token} = useAuth()
    const location = useLocation();
    console.log('Location: ', location)
    React.useEffect(() => {
        if (token === undefined) {
            navigate(`/login?redirect=${location.pathname}`)
        }

    }, [token])

    return (
        <>{props.children}</>
    )
}
