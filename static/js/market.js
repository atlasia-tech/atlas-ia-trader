const marketCards = document.getElementById("market-cards");
const marketSummary = document.getElementById("market-summary");
const marketClock = document.getElementById("market-clock");
const marketLastUpdate = document.getElementById("market-last-update");


function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(value || 0));
}


function formatPrice(value) {
    const number = Number(value || 0);

    if (number < 1) {
        return formatNumber(number, 4);
    }

    return formatNumber(number, 2);
}


function updateClock() {
    if (marketClock) {
        marketClock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}


function getAssetName(ativo) {
    return ativo.replace("-USDT-SWAP", "");
}


function getVariationClass(variation) {
    return Number(variation) >= 0 ? "positive" : "negative";
}


function renderMarketCards(ativos) {
    marketCards.innerHTML = ativos.map((ativo) => {
        const variationClass = getVariationClass(ativo.variacao_24h);
        const variationSign = Number(ativo.variacao_24h) >= 0 ? "+" : "";

        return `
            <article class="market-card">
                <div class="market-card-header">
                    <div class="market-symbol">
                        <span class="market-symbol-icon">
                            <i class="bi bi-currency-bitcoin"></i>
                        </span>

                        <div>
                            <strong>${getAssetName(ativo.ativo)}</strong>
                            <small>USDT Perp</small>
                        </div>
                    </div>

                    <span class="variation ${variationClass}">
                        ${variationSign}${formatNumber(ativo.variacao_24h)}%
                    </span>
                </div>

                <div class="market-price">
                    US$ ${formatPrice(ativo.ultimo_preco)}
                </div>

                <div class="market-details">
                    <div>
                        <span>Máxima 24h</span>
                        <strong>US$ ${formatPrice(ativo.maxima_24h)}</strong>
                    </div>

                    <div>
                        <span>Mínima 24h</span>
                        <strong>US$ ${formatPrice(ativo.minima_24h)}</strong>
                    </div>

                    <div>
                        <span>Volume 24h</span>
                        <strong>US$ ${formatNumber(ativo.volume_24h, 0)}</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}


function renderMarketSummary(ativos) {
    const positiveAssets = ativos.filter(
        (ativo) => Number(ativo.variacao_24h) >= 0
    ).length;

    const negativeAssets = ativos.length - positiveAssets;

    const strongestAsset = [...ativos].sort(
        (first, second) =>
            Number(second.variacao_24h) - Number(first.variacao_24h)
    )[0];

    const weakestAsset = [...ativos].sort(
        (first, second) =>
            Number(first.variacao_24h) - Number(second.variacao_24h)
    )[0];

    marketSummary.innerHTML = `
        <div class="market-summary-item">
            <span>Ativos monitorados</span>
            <strong>${ativos.length}</strong>
        </div>

        <div class="market-summary-item positive">
            <span>Em alta</span>
            <strong>${positiveAssets}</strong>
        </div>

        <div class="market-summary-item negative">
            <span>Em baixa</span>
            <strong>${negativeAssets}</strong>
        </div>

        <div class="market-summary-item">
            <span>Maior alta</span>
            <strong>
                ${getAssetName(strongestAsset.ativo)}
                (${formatNumber(strongestAsset.variacao_24h)}%)
            </strong>
        </div>

        <div class="market-summary-item">
            <span>Maior baixa</span>
            <strong>
                ${getAssetName(weakestAsset.ativo)}
                (${formatNumber(weakestAsset.variacao_24h)}%)
            </strong>
        </div>
    `;
}


async function loadMarket() {
    try {
        const response = await fetch("/mercado");

        if (!response.ok) {
            throw new Error("Não foi possível obter as cotações.");
        }

        const data = await response.json();
        const ativos = data.ativos || [];

        renderMarketCards(ativos);
        renderMarketSummary(ativos);

        if (marketLastUpdate) {
            marketLastUpdate.textContent =
                `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
        }
    } catch (error) {
        console.error(error);

        marketCards.innerHTML = `
            <div class="market-loading error">
                Não foi possível carregar as cotações da OKX.
            </div>
        `;

        marketSummary.innerHTML = `
            <div class="market-loading error">
                A leitura de mercado está indisponível.
            </div>
        `;
    }
}


updateClock();
setInterval(updateClock, 1000);

loadMarket();
setInterval(loadMarket, 30000);