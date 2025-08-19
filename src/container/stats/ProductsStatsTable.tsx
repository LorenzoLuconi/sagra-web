import * as React from "react";
import {useState} from "react";
import {
    Box,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
    useTheme
} from "@mui/material";
import {useProducts} from "../../context/ProductsStore.tsx";
import {orderBy} from "lodash";
import {currency} from "../../utils";
import {StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {SparkLineChart} from "@mui/x-charts";
import {DailyProductStatI} from "./Summary.ts";


enum OrderDirection {
    asc = "asc",
    desc = "desc"
}

interface ProductsTableStatsProps {
    productsInOrder: Record<number, StatsOrderedProducts>
    days: string[]
    isTotal?: boolean
    isPrint?: boolean
}

export const ProductsStatsTable: React.FC<ProductsTableStatsProps> = (props) => {
    const {productsInOrder, isTotal, isPrint, days} = props
    const theme = useTheme()

    enum ProductsOrderBy {
        name = "name",
        totalQuantity = "totalQuantity",
        totalAmount = "totalAmount",
    }

    const {products} = useProducts()
    const [prodOrderBy, setProdOrderBy] = useState<ProductsOrderBy>(ProductsOrderBy.totalAmount)
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.desc)

    const totalAmount = Object.values(productsInOrder).reduce((a, c) => a + c.totalAmount, 0);

    const productsIds = () => {
        const values = Object.values(productsInOrder);
        switch (prodOrderBy) {
            case ProductsOrderBy.totalQuantity:
            case ProductsOrderBy.totalAmount:
                return orderBy(values, prodOrderBy, orderDirection).map(v => v.productId);
            case ProductsOrderBy.name: {
                const valuesToOrder = values.map(p => {
                    return {
                        productId: p.productId,
                        name: products[p.productId].name,
                    }
                });

                return orderBy(valuesToOrder, prodOrderBy, orderDirection).map(v => v.productId);
            }
        }
    }

    const handleChangeOrder = (field: ProductsOrderBy) => {
        setProdOrderBy(field)
        setOrderDirection(orderDirection === OrderDirection.desc ? OrderDirection.asc : OrderDirection.desc)
    }

    return (
        <TableContainer component={Box}>
            <Table sx={{minWidth: 650, backgroundColor: theme.palette.background.default}} size={'small'}
                   aria-label="total table">
                <TableHead>
                    <TableRow>
                        <TableCell sortDirection={orderDirection}>
                            <TableSortLabel active={prodOrderBy === ProductsOrderBy.name} direction={orderDirection}
                                            onClick={() => handleChangeOrder(ProductsOrderBy.name)}>
                                Prodotto
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sortDirection={orderDirection} align="center">
                            <TableSortLabel active={prodOrderBy === ProductsOrderBy.totalQuantity}
                                            direction={orderDirection}
                                            onClick={() => handleChangeOrder(ProductsOrderBy.totalQuantity)}>
                                Quantità
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sortDirection={orderDirection} align="right">
                            <TableSortLabel active={prodOrderBy === ProductsOrderBy.totalAmount}
                                            direction={orderDirection}
                                            onClick={() => handleChangeOrder(ProductsOrderBy.totalAmount)}>
                                Importo
                            </TableSortLabel>
                        </TableCell>

                        <TableCell>Percentuale Importo</TableCell>
                        {isTotal && ! isPrint &&
                            <TableCell>
                                Importi Giornalieri
                            </TableCell>
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {productsIds().map((productId) => (
                        <TableRow
                            key={productId}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell component="th" scope="row">
                                {products[+productId].name}
                            </TableCell>
                            <TableCell align="center">{productsInOrder[+productId].totalQuantity}</TableCell>
                            <TableCell align="right">{currency(productsInOrder[+productId].totalAmount)}</TableCell>
                            <TableCell>
                                { isPrint ?
                                    <Typography>{Math.round(productsInOrder[+productId].totalAmount * 100 / totalAmount)}%</Typography>
                                :
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <LinearProgress sx={{height: 10, borderRadius: 5, width: '140px'}}
                                                        variant="determinate"
                                                        value={productsInOrder[+productId].totalAmount * 100 / totalAmount}/>
                                        <Typography variant="body2" sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.9em'
                                        }}>{Math.round(productsInOrder[+productId].totalAmount * 100 / totalAmount)}%</Typography>
                                    </Box>
                                }
                            </TableCell>
                            {isTotal && ! isPrint &&
                                <TableCell align="center">
                                    {buildChartFromDays(days, productsInOrder[+productId].days)}</TableCell>
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const buildChartFromDays = (days: string[], daysInfo: DailyProductStatI[]) => {
    const xData = []
    const yData = []
    for (let i=0; i<days.length; i++) {
        xData.push(days[i])
        const idx = daysInfo.findIndex((element) => element.day === days[i])
        if (idx === -1) {
            yData.push(0)
        } else {
            yData.push(daysInfo[idx].dailyAmount)
        }

    }
    // console.log('BuildChartFromDays: ', xData, yData)

    return (
        <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
            <SparkLineChart
                data={yData}
                width={100}
                height={32}
                plotType="bar"
                showHighlight
                showTooltip
                color="hsl(210, 98%, 42%)"
                xAxis={{
                    scaleType: 'band',
                    data: xData
                }}
            />
        </div>
    )


}

export default ProductsStatsTable