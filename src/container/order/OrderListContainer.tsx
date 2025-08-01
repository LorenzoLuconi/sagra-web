import {  Close, LibraryBooksOutlined } from "@mui/icons-material";
import {
  Box,
  Divider, FormControlLabel,
  IconButton,
  InputBase,
  Paper,
  Switch,
  Typography, useTheme
} from "@mui/material";
import OrderList from "./OrderList.tsx";
import SearchIcon from '@mui/icons-material/Search';
import * as React from "react";
import { useLocation } from "react-router";
import { getQueryObj } from "../../utils";
import { useState } from "react";
import { OrdersSearchQueryParams } from "../../api/sagra/sagraComponents.ts";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const OrderListContainer = () => {

  const theme = useTheme();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const searchObj = getQueryObj(search, {
    customer: "string",
    username: "string",
    created: "string",
    page: "number",
    size: "number"
  });

  const [searchByCustomer, setSearchByCustomer] = useState(searchObj?.customer??'');
  const [searchByCreated, setSearchByCreated] = useState<string>(() => {
    if (searchObj.created) {
      return dayjs(searchObj.created).format('YYYY-MM-DD');
    }
    return dayjs().format('YYYY-MM-DD');
  });

  const createSearchParam = () => {

    const params = {
      size: 2000 // TODO per il momento niente paginazione
    } as OrdersSearchQueryParams;

    Object.assign(params, searchByCustomer ? { customer: searchByCustomer } : null)
    Object.assign(params, searchByCreated ? { created: searchByCreated } : null)

    return params;
  }

  const [searchParam, setSearchParam] = useState<OrdersSearchQueryParams>( () => createSearchParam() )

  const handleClickSearch = () => {
    setSearchParam(createSearchParam());
  }

  const handleChangeCustomer =
    React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setSearchByCustomer(event.currentTarget.value);
      }, [setSearchByCustomer]
    );

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', mt: 2, mb: 1, gap: 2, alignItems: 'center'}}>
        <LibraryBooksOutlined />
        <Typography sx={{fontWeight: 700, fontSize: '1.5em'}}>Elenco degli Ordini</Typography>
      </Box>


      <Paper id="order-search-bar" variant="outlined"
             sx={{p: 2, display: 'flex', justifyContent: 'center', backgroundColor: theme.sagra.panelBackground }}
             className="paper-top">

        <Paper
          component="form"
          sx={{  p: '2px 4px', display: 'flex', alignItems: 'center', width: '70%', minWidth: '600px' }}
        >

          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Nome cliente"
            value={searchByCustomer}
            onChange={handleChangeCustomer}
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
          <Divider sx={{ display: 'none', height: 28, m: 0.5 }} orientation="vertical" />
          <FormControlLabel sx={{ display: 'none'}} control={<Switch defaultChecked />} label="Solo ordini utente" />
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleClickSearch}>
            <SearchIcon />
          </IconButton>

        </Paper>
      </Paper>
      <Paper variant="outlined"
             sx={{ p: 3, mb: 2, backgroundColor: theme.sagra.panelBackground }}
             className="paper-bottom">
        <OrderList searchQueryParam={searchParam}/>
      </Paper>
    </>
  )
}

export default OrderListContainer;