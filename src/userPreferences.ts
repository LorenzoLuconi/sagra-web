
type ProductViewT = 'list' | 'grid'

export interface UserPreferencesI {
    productView: ProductViewT
}

export const defaultUserPreferences: UserPreferencesI = {
    productView: 'grid'
}