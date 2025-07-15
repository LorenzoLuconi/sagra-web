
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