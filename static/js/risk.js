const riskClock = document.getElementById("risk-clock");

const riskStatusTitle = document.getElementById("risk-status-title");
const riskStatusDescription = document.getElementById("risk-status-description");
const riskStatusBadge = document.getElementById("risk-status-badge");

const riskMargin = document.getElementById("risk-margin");
const riskExposure = document.getElementById("risk-exposure");
const riskConcentration = document.getElementById("risk-concentration");
const riskPositions = document.getElementById("risk-positions");

const riskExposureAsset = document.getElementById("risk-exposure-asset");
const riskExposureSide = document.getElementById("risk-exposure-side");
const riskExposureValue = document.getElementById("risk-exposure-value");
const riskExposureMargin = document.getElementById("risk-exposure-margin");

const riskLossAsset = document.getElementById("risk-loss-asset");
const riskLossSide = document.getElementById("risk-loss-side");
const riskLossValue = document.getElementById("risk-loss-value");
const riskLossRoi = document.getElementById("risk-loss-roi");

const riskLastUpdate = document.getElementById("risk-last-update");


function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(value || 0));
}


function updateClock() {
    if (riskClock) {
        riskClock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}


function getStatusClass(score) {
    if (score >= 85) {
        return "healthy";
    }

    if (score >= 65) {
        return "attention";
    }

    return "elevated";
}


function renderRisk(data) {
    const analysis = data.analise || {};
    const summary = data.resumo || {};

    const score = Number(analysis.atlas_score || 0);
    const status = analysis.status_score || "NÃO INFORMADO";
    const risk = analysis.risco || "NÃO INFORMADO";

    const exposure = analysis.maior_exposicao || {};
    const loss = analysis.maior_prejuizo || {};

    riskStatusTitle.textContent = `Risco atual: ${risk}`;
    riskStatusDescription.textContent =
        `Score operacional ${score}/100 · ${summary.total_posicoes || 0} `
        + "posições abertas monitoradas pela Trading Account.";

    riskStatusBadge.textContent = status;
    riskStatusBadge.className =
        `risk-status-badge ${getStatusClass(score)}`;

    riskMargin.textContent =
        `${formatNumber(analysis.percentual_margem)}%`;

    riskExposure.textContent =
        `${formatNumber(analysis.percentual_exposicao)}%`;

    riskConcentration.textContent =
        `${formatNumber(analysis.concentracao_maior_posicao)}%`;

    riskPositions.textContent = summary.total_posicoes || 0;

    riskExposureAsset.textContent = exposure.ativo || "Sem dados";
    riskExposureSide.textContent = exposure.lado || "—";
    riskExposureValue.textContent =
        `US$ ${formatNumber(exposure.valor_notional)}`;

    riskExposureMargin.textContent =
        `US$ ${formatNumber(exposure.margem_inicial)}`;

    riskLossAsset.textContent = loss.ativo || "Sem dados";
    riskLossSide.textContent = loss.lado || "—";
    riskLossValue.textContent =
        `${formatNumber(loss.lucro_prejuizo)} USDT`;

    riskLossRoi.textContent =
        `${formatNumber(loss.roi)}%`;

    riskLastUpdate.textContent =
        `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
}


async function loadRisk() {
    try {
        const response = await fetch("/analysis");

        if (!response.ok) {
            throw new Error("Não foi possível carregar os dados de risco.");
        }

        const data = await response.json();

        renderRisk(data);
    } catch (error) {
        console.error(error);

        riskStatusTitle.textContent =
            "Dados de risco temporariamente indisponíveis";

        riskStatusDescription.textContent =
            "Não foi possível consultar os dados atuais da OKX.";
    }
}


updateClock();
setInterval(updateClock, 1000);

loadRisk();
setInterval(loadRisk, 15000);