import {OrderStatsResponse} from "../../api/sagra/sagraComponents.ts";
import {StatsOrder, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";
import {cloneDeep} from "lodash";

export interface DailyProductStatI  {
    day: string
    dailyAmount: number
    /**
     * Quantità venduta del prodotto
     *
     * @format int64
     */
    dailyQuantity: number
}

export interface DailyProductStatsI {
    days: DailyProductStatI[]
}



export interface SummaryI {
    totalServiceNumber: number
    totalAmount: number
    count: number
    totalTakeAwayAmount: number
    totalTakeAwayCount: number
    productsTable: Record<number, StatsOrderedProducts  & DailyProductStatsI>
    departments: Record<number, number>
}

const updateProductsTable = (day: string, dayStats: StatsOrder, productsTable: Record<number, StatsOrderedProducts & DailyProductStatsI>) => {
    console.log('updateProductsTable: ', productsTable)
    Object.values(dayStats.products).forEach(p => {
        const productInTable = productsTable[p.productId]
        if (productInTable === undefined) {
            productsTable[p.productId] = {...p, days: [{day: day, dailyQuantity: p.totalQuantity, dailyAmount: p.totalAmount}]}
        } else {
            if (productsTable[p.productId].days === undefined) {
                productsTable[p.productId].days = []
            }

            const days: DailyProductStatI[] =  cloneDeep(productsTable[p.productId].days)
            days.push({day: day, dailyQuantity: p.totalQuantity, dailyAmount: p.totalAmount})
            productsTable[p.productId] = {
                productId: p.productId,
                totalQuantity: productsTable[p.productId].totalQuantity + p.totalQuantity,
                totalAmount: productsTable[p.productId].totalAmount + p.totalAmount,
                days: days
            } as StatsOrderedProducts & DailyProductStatsI
        }
    })
}

export const calculateSummary = ( stats: OrderStatsResponse ) => {

    const result: SummaryI = {
        totalAmount: 0,
        count: 0,
        totalServiceNumber: 0,
        totalTakeAwayAmount: 0,
        totalTakeAwayCount: 0,
        productsTable: {},
        departments: {}
    }

    Object.keys(stats).forEach((day) => {
        const dayStats = stats[day]
        result.totalAmount += dayStats.totalAmount
        result.totalServiceNumber += dayStats.totalServiceNumber
        result.count += dayStats.count
        result.totalTakeAwayAmount += dayStats.takeAway?.totalAmount ?? 0
        result.totalTakeAwayCount += dayStats.takeAway?.count ?? 0

        dayStats.departments.forEach(depStat => {
            if ( result.departments[depStat.id] ) {
                result.departments[depStat.id] += depStat.totalAmount
            } else {
                result.departments[depStat.id] = depStat.totalAmount
            }
        })

        updateProductsTable(day, dayStats, result.productsTable)
    })

    return result
}