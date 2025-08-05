import {OrderStatsResponse} from "../../api/sagra/sagraComponents.ts";
import {StatsOrder, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";


export interface SummaryI {
    totalServiceNumber: number
    totalAmount: number
    count: number
    totalTakeAwayAmount: number
    totalTakeAwayCount: number
    productsTable: Record<number, StatsOrderedProducts>
    departments: Record<number, number>
}

const updateProductsTable = (dayStats: StatsOrder, productsTable: Record<number, StatsOrderedProducts>) => {
    Object.values(dayStats.products).forEach(p => {
        const productInTable = productsTable[p.productId]
        if (productInTable === undefined) {
            productsTable[p.productId] = p
        } else {
            productsTable[p.productId] = {
                productId: p.productId,
                totalQuantity: productsTable[p.productId].totalQuantity + p.totalQuantity,
                totalAmount: productsTable[p.productId].totalAmount + p.totalAmount,

            } as StatsOrderedProducts
        }
    })
}


export const calculateSummary = (stats: OrderStatsResponse ) => {

    const result: SummaryI = {
        totalAmount: 0,
        count: 0,
        totalServiceNumber: 0,
        totalTakeAwayAmount: 0,
        totalTakeAwayCount: 0,
        productsTable: {},
        departments: {}
    }

    Object.values(stats).forEach((dayStats) => {
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

        updateProductsTable(dayStats, result.productsTable)
    })

    return result
}