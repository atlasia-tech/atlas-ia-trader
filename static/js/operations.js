const positionsBody = document.getElementById("operations-table-body");
const totalPositionsElement = document.getElementById("total-positions");
const totalExposureElement = document.getElementById("total-exposure");
const usedMarginElement = document.getElementById("used-margin");
const searchInput = document.getElementById("operations-search");
const clockElement = document.getElementById("operations-clock");
const lastUpdateElement = document.getElementById("operations-last-update");

let operations = [];


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
    if (!clockElement) {
        return;
    }

    clockElement.textContent = new Date().toLocaleTimeString("pt-BR");
}


function updateLastUpdate() {
    if (!lastUpdateElement) {
        return;
    }

    lastUpdateElement.textContent =
        `Última atualização: ${new Date().toLocaleTimeString("pt-BR")}`;
}


function getProfitClass(value) {
    if (Number(value) > 0) {
        return "positive";
    }

    if (Number(value) < 0) {
        return "negative";
    }

    return "neutral";
}


function getAssetMarkup(ativo) {
    if (typeof coinNameMarkup === "function") {
        return coinNameMarkup(ativo);
    }

    return `<strong>${ativo}</strong>`;
}


function renderOperations(items) {
    if (!positionsBody) {
        return;
    }

    if (!items.length) {
        positionsBody.innerHTML = `
            <tr>
                <td colspan="9" class="table-empty">
                    Nenhuma posição aberta encontrada.
                </td>
            </tr>
        `;
        return;
    }

    positionsBody.innerHTML = items.map((operation) => {
        const isLong = operation.lado === "LONG";
        const profitClass = getProfitClass(operation.lucro_prejuizo);
        const roiClass = getProfitClass(operation.roi);

        return `
            <tr>
                <td>
                    ${getAssetMarkup(operation.ativo)}
                </td>

                <td>
                    <span class="side-badge ${isLong ? "long" : "short"}">
                        ${operation.lado}
                    </span>
                </td>

                <td>${operation.alavancagem}x</td>

                <td>${formatPrice(operation.entrada)}</td>

                <td>${formatPrice(operation.preco_atual)}</td>

                <td>US$ ${formatNumber(operation.margem_inicial)}</td>

                <td>US$ ${formatNumber(operation.valor_notional)}</td>

                <td class="${profitClass}">
                    ${Number(operation.lucro_prejuizo) >= 0 ? "+" : ""}
                    ${formatNumber(operation.lucro_prejuizo)} USDT
                </td>

                <td class="${roiClass}">
                    ${Number(operation.roi) >= 0 ? "+" : ""}
                    ${formatNumber(operation.roi)}%
                </td>
            </tr>
        `;
    }).join("");
}


function updateMetrics(portfolio) {
    if (totalPositionsElement) {
        totalPositionsElement.textContent = portfolio.total_posicoes ?? "—";
    }

    if (totalExposureElement) {
        totalExposureElement.textContent =
            `US$ ${formatNumber(portfolio.exposicao_total)}`;
    }

    if (usedMarginElement) {
        usedMarginElement.textContent =
            `US$ ${formatNumber(portfolio.margem_utilizada)}`;
    }
}


async function loadOperations() {
    try {
        const response = await fetch("/portfolio");

        if (!response.ok) {
            throw new Error("Não foi possível carregar as posições.");
        }

        const portfolio = await response.json();

        operations = portfolio.operacoes || [];

        updateMetrics(portfolio);
        renderOperations(operations);
        updateLastUpdate();
    } catch (error) {
        console.error(error);

        if (positionsBody) {
            positionsBody.innerHTML = `
                <tr>
                    <td colspan="9" class="table-empty">
                        Não foi possível carregar os dados da OKX.
                    </td>
                </tr>
            `;
        }
    }
}


function filterOperations() {
    const term = (searchInput?.value || "").trim().toLowerCase();

    const filteredOperations = operations.filter((operation) => {
        return (
            operation.ativo.toLowerCase().includes(term) ||
            operation.lado.toLowerCase().includes(term)
        );
    });

    renderOperations(filteredOperations);
}


if (searchInput) {
    searchInput.addEventListener("input", filterOperations);
}


updateClock();
setInterval(updateClock, 1000);

loadOperations();
setInterval(loadOperations, 15000);