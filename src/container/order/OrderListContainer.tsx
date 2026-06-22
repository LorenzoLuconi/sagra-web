import {Close, LibraryBooksOutlined} from "@mui/icons-material";
import {Divider, FormControlLabel, IconButton, InputBase, Paper, Switch, useTheme} from "@mui/material";
import OrderList from "./OrderList.tsx";
import SearchIcon from '@mui/icons-material/Search';
import * as React from "react";
import {useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {getQueryObj} from "../../utils";
import {DatePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {cloneDeep, set} from "lodash";
import PageTitle from "../../view/PageTitle.tsx";
import {useAuth} from "../../context/AuthStore.tsx";

export interface SearchParamsI {
  created?: string
  customer?: string
  username?: string
  page: number
  size: number
}
export const rowsPerPageOptions = [10, 20, 50]

const initialStateDate = () => {
  return dayjs().format('YYYY-MM-DD');
}

interface OrderListSearchI {
  currentUsername?: string
  handleUpdate: (searchParams: SearchParamsI) => void
  onOnlyCurrentUserOrdersChange: (checked: boolean) => void
  onlyCurrentUserOrders: boolean
}

export const orderQuery = (search: URLSearchParams) =>  getQueryObj(search, {
  customer: "string",
  username: "string",
  created: "string",
  page: "number",
  size: "number"
});

const OrderListSearch: React.FC<OrderListSearchI> = (props) => {

  const location = useLocation();
  const search = new URLSearchParams(location.search);

  const searchObj = orderQuery(search)

  const customer = search.get('customer') ?? ''
  const created = search.get('created') ?? initialStateDate()


  const [searchByCustomer, setSearchByCustomer] = useState<string>(customer);
  const [searchByCreated, setSearchByCreated] = useState<string>(created);

  React.useEffect(() => {
    setSearchByCustomer(customer)
  }, [customer])

  React.useEffect(() => {
    setSearchByCreated(created)
  }, [created])



  const handleClickSearch = () => {


    const res: SearchParamsI = cloneDeep({
      page: searchObj.page ?? 0,
      size: searchObj.size ?? rowsPerPageOptions[0],
      customer: searchObj.customer,
      created: searchObj.created,
      username: props.onlyCurrentUserOrders ? props.currentUsername : undefined,
    })
    set(res, 'created', searchByCreated)
    set(res, 'customer', searchByCustomer)

    props.handleUpdate(res);

  }

  const handleChangeCustomer =
      React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setSearchByCustomer(event.currentTarget.value);
          }, [setSearchByCustomer]
      );

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ( event.key == 'Enter' ) {
      handleClickSearch()
    }

    if ( event.key == 'Escape' ) {
      setSearchByCustomer('')
    }
  };

  return (
      <Paper
          sx={{  p: '2px 4px', display: 'flex', alignItems: 'center', width: '70%', minWidth: '600px' }}
      >

        <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Nome cliente da ricercare"
            value={searchByCustomer}
            onChange={handleChangeCustomer}
            onKeyUp={handleKeyPress}
            inputProps={{ 'aria-label': 'search by customer' }}

        />
        <IconButton sx={{ p: '10px' }} aria-label="menu" onClick={() => setSearchByCustomer('')}>
          <Close />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <DatePicker value={dayjs(searchByCreated)}
                    onChange={ (v) => setSearchByCreated(v ? v.format( 'YYYY-MM-DD') : '')}
                    slotProps={{
                      field: { clearable: true },
                    }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <FormControlLabel
            control={
              <Switch
                  checked={props.onlyCurrentUserOrders}
                  onChange={(_event, checked) => props.onOnlyCurrentUserOrdersChange(checked)}
              />
            }
            label="Solo ordini utente"
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleClickSearch}>
          <SearchIcon />
        </IconButton>

      </Paper>
  )
}



const OrderListContainer = () => {

  const theme = useTheme();
  const navigate = useNavigate()
  const location = useLocation()
  const queryString = new URLSearchParams(location.search)
  const {user} = useAuth()
  const currentUsername = user?.username
  const [onlyCurrentUserOrders, setOnlyCurrentUserOrders] = React.useState(true)

  const searchObj = orderQuery(queryString)

  React.useEffect(() => {
    const searchQuery = new URLSearchParams(location.search)
    let changed = false;

    if (!searchQuery.has('created')) {
      searchQuery.set('created', initialStateDate())
      changed = true;
    }

    if (onlyCurrentUserOrders && currentUsername && searchQuery.get('username') !== currentUsername) {
      searchQuery.set('username', currentUsername)
      changed = true;
    }

    if (changed) {
      navigate(`/orders?${searchQuery.toString()}`, {replace: true})
    }

  }, [currentUsername, location.search, navigate, onlyCurrentUserOrders])

  const handleOnlyCurrentUserOrdersChange = React.useCallback((checked: boolean) => {
    setOnlyCurrentUserOrders(checked)

    const searchQuery = new URLSearchParams(location.search)
    if (checked && currentUsername) {
      searchQuery.set('username', currentUsername)
    } else {
      searchQuery.delete('username')
    }
    searchQuery.set('page', '0')

    navigate(`/orders?${searchQuery.toString()}`)
  }, [currentUsername, location.search, navigate])


  const pageSize = queryString.get('size') ?? rowsPerPageOptions[0]
  console.log('PageSize: ', pageSize)
  //const pageNum = queryString.get('page') ?? '0'
  return (
      <>
        <PageTitle title="Elenco degli Ordini" icon={ <LibraryBooksOutlined />} />

        <Paper id="order-search-bar" variant="outlined"
               sx={{p: 2, display: 'flex', justifyContent: 'center', backgroundColor: theme.sagra.panelBackground }}
               className="paper-top">

          <OrderListSearch
              currentUsername={currentUsername}
              onlyCurrentUserOrders={onlyCurrentUserOrders}
              onOnlyCurrentUserOrdersChange={handleOnlyCurrentUserOrdersChange}
              handleUpdate={(searchParams: SearchParamsI) => {

            const {created, customer, username} = searchParams

            console.log('SEARCH: ', searchParams)

            const searchQuery = new URLSearchParams()



            if (created !== undefined && created.length > 0 ){
              searchQuery.set('created', created)
            }
            if (customer !== undefined && customer.length > 0) {
              searchQuery.set('customer', customer)
            }
            if (username !== undefined && username.length > 0) {
              searchQuery.set('username', username)
            }
            searchQuery.set('page', '0')
            searchQuery.set('size', String(searchObj['size'] ?? rowsPerPageOptions[0]))

            navigate(`/orders?${searchQuery.toString()}`)



          }}/>

        </Paper>
        <Paper variant="outlined"
               sx={{ p: 3, mb: 2, backgroundColor: theme.sagra.panelBackground }}
               className="paper-bottom">
          <OrderList
              handleUpdate={(searchParams:SearchParamsI) => {
                const {page, size} = searchParams
                const searchQuery = new URLSearchParams(queryString)
                searchQuery.set('page', `${page}`)
                searchQuery.set('size', `${size}`)

                navigate(`/orders?${searchQuery.toString()}`)
            }}
          />
        </Paper>
      </>
  )
}

export default OrderListContainer;
