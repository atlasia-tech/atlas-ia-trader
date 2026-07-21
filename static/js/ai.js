const aiClock = document.getElementById("ai-clock");
const aiTitle = document.getElementById("ai-title");
const aiDescription = document.getElementById("ai-description");

const aiScore = document.getElementById("ai-score");
const aiScoreStatus = document.getElementById("ai-score-status");
const aiScoreRing = document.getElementById("ai-score-ring");
const aiScoreDescription = document.getElementById("ai-score-description");

const aiMargin = document.getElementById("ai-margin");
const aiExposure = document.getElementById("ai-exposure");
const aiConcentration = document.getElementById("ai-concentration");
const aiRisk = document.getElementById("ai-risk");

const aiBestAsset = document.getElementById("ai-best-asset");
const aiBestDetails = document.getElementById("ai-best-details");

const aiWorstAsset = document.getElementById("ai-worst-asset");
const aiWorstDetails = document.getElementById("ai-worst-details");

const aiExposureAsset = document.getElementById("ai-exposure-asset");
const aiExposureDetails = document.getElementById("ai-exposure-details");

const aiLastUpdate = document.getElementById("ai-last-update");


function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(value || 0));
}


function updateClock() {
    if (aiClock) {
        aiClock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}


function getScoreColor(score) {
    if (score >= 85) {
        return "#29d77c";
    }

    if (score >= 65) {
        return "#f6b93b";
    }

    return "#ff5d73";
}


function renderAnalysis(data) {
    const analysis = data.analise || {};
    const summary = data.resumo || {};

    const score = Number(analysis.atlas_score || 0);
    const risk = analysis.risco || "NÃO INFORMADO";
    const status = analysis.status_score || "CARREGANDO";

    const scoreColor = getScoreColor(score);

    aiScore.textContent = score;
    aiScoreStatus.textContent = status;
    aiScoreRing.style.background =
        `conic-gradient(${scoreColor} ${score * 3.6}deg, #21334d 0deg)`;

    aiMargin.textContent =
        `${formatNumber(analysis.percentual_margem)}%`;

    aiExposure.textContent =
        `${formatNumber(analysis.percentual_exposicao)}%`;

    aiConcentration.textContent =
        `${formatNumber(analysis.concentracao_maior_posicao)}%`;

    aiRisk.textContent = risk;
    aiRisk.style.color = scoreColor;

    aiTitle.textContent = `Score ${score}/100: ${status}`;

    aiDescription.textContent =
        `Leitura informativa: ${summary.total_posicoes || 0} posições abertas, `
        + `${formatNumber(analysis.percentual_margem)}% do patrimônio em margem `
        + `e ${formatNumber(analysis.percentual_exposicao)}% em exposição.`;

    aiScoreDescription.textContent =
        "O Atlas Score é um indicador operacional baseado em margem, exposição, "
        + "concentração, equilíbrio entre posições e resultados em aberto.";

    renderHighlights(analysis);

    if (aiLastUpdate) {
        aiLastUpdate.textContent =
            `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
    }
}


function renderHighlights(analysis) {
    const best = analysis.maior_lucro || {};
    const worst = analysis.maior_prejuizo || {};
    const exposure = analysis.maior_exposicao || {};

    aiBestAsset.textContent = best.ativo || "Sem dados";
    aiBestDetails.textContent =
        `P/L: +${formatNumber(best.lucro_prejuizo)} USDT · `
        + `ROI: ${formatNumber(best.roi)}%`;

    aiWorstAsset.textContent = worst.ativo || "Sem dados";
    aiWorstDetails.textContent =
        `P/L: ${formatNumber(worst.lucro_prejuizo)} USDT · `
        + `ROI: ${formatNumber(worst.roi)}%`;

    aiExposureAsset.textContent = exposure.ativo || "Sem dados";
    aiExposureDetails.textContent =
        `Exposição: US$ ${formatNumber(exposure.valor_notional)} · `
        + `Margem: US$ ${formatNumber(exposure.margem_inicial)}`;
}


async function loadAnalysis() {
    try {
        const response = await fetch("/analysis");

        if (!response.ok) {
            throw new Error("Não foi possível carregar a análise.");
        }

        const data = await response.json();

        renderAnalysis(data);
    } catch (error) {
        console.error(error);

        aiTitle.textContent = "Análise temporariamente indisponível";
        aiDescription.textContent =
            "Não foi possível consultar os dados atuais da operação.";
    }
}


updateClock();
setInterval(updateClock, 1000);

loadAnalysis();
setInterval(loadAnalysis, 15000);