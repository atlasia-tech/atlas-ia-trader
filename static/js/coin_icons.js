const COIN_ICON_URLS = {
    AAVE: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/aave.png",
    APE: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/ape.png",
    AVAX: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/avax.png",
    BTC: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png",
    DOGE: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/doge.png",
    ETH: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png",
    HBAR: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/hbar.png",
    NEAR: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/near.png",
    SAND: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sand.png",
    SOL: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png",
    XLM: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/xlm.png",
    XRP: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/xrp.png",
};


function getCoinSymbol(ativo) {
    return String(ativo || "")
        .toUpperCase()
        .split("-")[0]
        .trim();
}


function coinIconMarkup(ativo) {
    const symbol = getCoinSymbol(ativo);
    const iconUrl = COIN_ICON_URLS[symbol];

    if (!iconUrl) {
        return `
            <span class="coin-icon coin-icon-fallback">
                ${symbol.slice(0, 1) || "?"}
            </span>
        `;
    }

    return `
        <img
            class="coin-icon"
            src="${iconUrl}"
            alt="${symbol}"
            title="${symbol}"
            onerror="this.outerHTML='<span class=&quot;coin-icon coin-icon-fallback&quot;>${symbol.slice(0, 1)}</span>'"
        >
    `;
}


function coinNameMarkup(ativo) {
    return `
        <span class="coin-name">
            ${coinIconMarkup(ativo)}
            <span>${ativo}</span>
        </span>
    `;
}