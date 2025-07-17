
export const getQueryObj = (searchParams: URLSearchParams, queryConf: Record<string, string>) => {
    const res: any = {}
    // console.log('SearchParams: ', searchParams)
    const qKeys = Object.keys(queryConf);
    for (let k=0; k<qKeys.length; k++) {
        const qq = searchParams.getAll(qKeys[k]);
          console.log('SeachValue: ', qKeys[k], qq);
        if (qq !== undefined && qq.length > 0) {
            res[qKeys[k]] = qq;
        }
    }
    return res;
}

export const FULL_DATE_CONF: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
}

export const TIME_CONF: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
}


export const convertDate = (locale: string, date: Date, dataConversion?: Intl.DateTimeFormatOptions): string => {
    const o = dataConversion ?? {
        year: "numeric",
        month: "long",
        day: "numeric"
    } as Intl.DateTimeFormatOptions
    //  console.log('DataConverion?: ', o, locale, date);
    return new Intl.DateTimeFormat(locale, o).format(date);
}

export const currencyEuro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

export const currency = (value : number) : string => {
  return currencyEuro.format(value)
}