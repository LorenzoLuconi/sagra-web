import * as React from 'react'
import {cloneDeep} from "lodash";

type ApplicationType = string | number | boolean | object

interface ApplicicationContextI {
    set: (key: string, value: ApplicationType) => void
    get: (key: string) => ApplicationType | undefined
}

export const ApplicationContext = React.createContext<ApplicicationContextI>({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set: (key: string, value: ApplicationType) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: (key: string) => undefined
})


interface ApplicationStoreI extends React.PropsWithChildren {
    initValues: Record<string, ApplicationType>
}

const ApplicationStore: React.FC<ApplicationStoreI> = (props) => {
    const [applicationStore, setApplicationStore] = React.useState<Record<string, ApplicationType>>(props.initValues)

    const getHandler = (key: string) => {
        console.log('Get: ', key, applicationStore[key])
        return applicationStore[key]
    }

    const setHandler = (key: string, value: ApplicationType) => {

        setApplicationStore((prev) => {
            const res = cloneDeep(prev)

            res[key] = value

            return res
        })
    }


    return (
        <ApplicationContext.Provider value={{
            get: getHandler,
            set: setHandler
        }}>
            {props.children}
        </ApplicationContext.Provider>
    )

}


export default ApplicationStore
export const useApplicationStore = () => {
    const appContext = React.useContext(ApplicationContext)
    return appContext
}