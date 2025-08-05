import {OrderStatsResponse} from "../../api/sagra/sagraComponents.ts";
import {StatsOrder, StatsOrderedProducts} from "../../api/sagra/sagraSchemas.ts";


export interface SummaryI {
    totalServiceNumber: number
    totalAmount: number
    count: number
    totalTakeAwayAmount: number
    totalTakeAwayCount: number
    productsTable: Record<number, StatsOrderedProducts>
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
        productsTable: {}
    }

    Object.values(stats).forEach((dayStats) => {
        result.totalAmount += dayStats.totalAmount
        result.totalServiceNumber += dayStats.totalServiceNumber
        result.count += dayStats.count
        result.totalTakeAwayAmount += dayStats.takeAway?.totalAmount ?? 0
        result.totalTakeAwayCount += dayStats.takeAway?.count ?? 0

        updateProductsTable(dayStats, result.productsTable)
    })

    // for (let i = 0; i < dayKeys.length; i++) {
    //     const day = dayKeys[i]
    //     const dayStats = stats[day]
    //     const _daySummary= daySummary(dayStats, productsTable)
    //     _totalServiceNumber += totalServiceNumber
    //     _totalAmount += totalAmount
    //     _totalCount += count
    //     _totalTakeAwayAmount += totalTakeAwayAmount
    //     _totalTakeAwayCount += totalTakeAwayCount
    //     console.log("Departments init", departments)
    //     if (departments) {
    //         departments.forEach((dStat: StatsOrderDepartment) => {
    //             const exTotalAmount = _departments[dStat.id]
    //             if (exTotalAmount !== undefined) {
    //                 console.log('exTotalAmount', exTotalAmount)
    //                 console.log('totalAmount', dStat.totalAmount)
    //                 _departments[dStat.id] = exTotalAmount + dStat.totalAmount
    //             } else {
    //                 _departments[dStat.id] = dStat.totalAmount
    //             }
    //             console.log("Departments Stats: ", _departments)
    //         })
    //     }
    // }

    return result
}