interface SagraWebConfI {
    sagraStartDay: string
    sagraEndDay: string
    apiUrl: string
    showProductImages: boolean
    title: string
    showThemeSwitcher: boolean
}

export class AppConf {
    private static instance: AppConf
    private apiUrl: string
    private sagraStartDay: string
    private sagraEndDay: string
    private title: string
    private showProductImages: boolean
    private showThemeSwitcher: boolean
    private constructor()  {
        const {sagraWeb} = window as SagraWebConfI
        this.apiUrl = sagraWeb.apiUrl
        this.sagraStartDay = sagraWeb.sagraStartDay
        this.sagraEndDay = sagraWeb.sagraEndDay
        this.showProductImages = sagraWeb.showProductImages
        this.title = sagraWeb.title
        this.showThemeSwitcher = sagraWeb.showThemeSwitcher
    }

    public static getInstance() {
        if (!AppConf.instance) {
            AppConf.instance = new AppConf()
        }
        return AppConf.instance
    }

    public static getApiUrl() {
        return AppConf.getInstance().apiUrl
    }

    public static getSagraStartDay() {
        return AppConf.getInstance().sagraStartDay
    }

    public static getSagraEndDay() {
        return AppConf.getInstance().sagraEndDay
    }

    public static showProductImages() {
        return AppConf.getInstance().showProductImages
    }

    public static getTitle() {
        return AppConf.getInstance().title
    }

    public static showThemeSwitcher() {
        return AppConf.getInstance().showThemeSwitcher
    }

}