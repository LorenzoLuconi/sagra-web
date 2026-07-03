import {OrderedProduct} from "../../api/sagra/sagraSchemas.ts";
import {Box, Button, Divider, Menu, MenuItem, Typography} from "@mui/material";
import {currency} from "../../utils";
import {useOrderStore} from "../../context/OrderStore.tsx";
import { EuroOutlined } from "@mui/icons-material";
import * as React from "react";
import {discountsSearchQuery} from "../../api/sagra/sagraComponents.ts";
import {useQuery} from "@tanstack/react-query";

const OrderEditTotal = () => {

  const {order, updateOrderField, originalOrder} = useOrderStore()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUpdateDiscount = (rate? : number) => {
      updateOrderField('discountRate', rate);
      setAnchorEl(null);
  };

  const discountsSearchConf = discountsSearchQuery({});
  const discountsQuery = useQuery({
    queryKey: discountsSearchConf.queryKey,
    queryFn: discountsSearchConf.queryFn,
  });

  const originalTotal = () => {
    let t = 0;
    if (order.serviceNumber && ! order.takeAway) {
      t = order.serviceCost * order.serviceNumber;
    }

    order.products.forEach((p: OrderedProduct) => {
      t = t + p.quantity * p.price;
    });

    return t;
  };

  const total = () => {
    const t = originalTotal();

    if ( order.discountRate )
      return t * ( 100  - order.discountRate)/100;

    return t;
  };


  if (discountsQuery.isFetched) {
    const totalAmount = total();
    const originalTotalAmount = originalTotal();

    return (
        <>
          <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, flexWrap: 'wrap'}}>
              <Typography
                  sx={{fontWeight: 700, fontSize: '2.0em', justifyContent: 'center'}}>{currency(totalAmount)}</Typography>
              {order.discountRate &&
                  <Typography
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.9em',
                        textDecoration: 'line-through',
                      }}
                  >
                    {currency(originalTotalAmount)}
                  </Typography>
              }
            </Box>
            <Box sx={{ml: 2}}>
              <Button size="small" variant="outlined" startIcon={<EuroOutlined/>}
                      onClick={handleClick}
              >{order.discountRate ? `Sconto ${order.discountRate}%` : 'Applica sconto'}</Button>
              <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  slotProps={{
                    list: {
                      'aria-labelledby': 'basic-button',
                    },
                  }}
              >
                <MenuItem key={"orig-discount"} onClick={() =>  handleUpdateDiscount(originalOrder.discountRate)}>{
                  originalOrder.discountRate ? `Mantieni sconto attuale (${originalOrder.discountRate}%)` : 'Mantieni nessuno sconto'}
                </MenuItem>
                <Divider />
                { originalOrder.discountRate &&
                      <MenuItem key={"no-discount"} onClick={() => handleUpdateDiscount() }>Nessuno sconto</MenuItem>
                }

                { discountsQuery.data?.map( (d) =>
                  <MenuItem key={d.id} onClick={() => handleUpdateDiscount(d.rate)}>{`${d.name} (${d.rate}%)`}</MenuItem>
                )}

              </Menu>
            </Box>
          </Box>
        </>
    );
  }
};

export default OrderEditTotal;
