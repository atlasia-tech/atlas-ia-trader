const analyticsClock = document.getElementById("analytics-clock");

const analyticsEquity = document.getElementById("analytics-equity");
const analyticsPnl = document.getElementById("analytics-pnl");
const analyticsExposure = document.getElementById("analytics-exposure");
const analyticsSnapshots = document.getElementById("analytics-snapshots");

const analyticsLongs = document.getElementById("analytics-longs");
const analyticsShorts = document.getElementById("analytics-shorts");
const analyticsTotalPositions = document.getElementById("analytics-total-positions");

const analyticsScore = document.getElementById("analytics-score");
const analyticsScoreStatus = document.getElementById("analytics-score-status");
const analyticsScoreRing = document.getElementById("analytics-score-ring");
const analyticsScoreDescription = document.getElementById(
    "analytics-score-description"
);

const analyticsLastUpdate = document.getElementById("analytics-last-update");

let equityChart = null;


function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(value || 0));
}


function updateClock() {
    if (analyticsClock) {
        analyticsClock.textContent = new Date().toLocaleTimeString("pt-BR");
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


function updatePortfolioMetrics(portfolio, trading) {
    analyticsEquity.textContent =
        `US$ ${formatNumber(trading.patrimonio_total)}`;

    analyticsPnl.textContent =
        `${Number(portfolio.lucro_total) >= 0 ? "+" : ""}`
        + `${formatNumber(portfolio.lucro_total)} USDT`;

    analyticsExposure.textContent =
        `US$ ${formatNumber(portfolio.exposicao_total)}`;

    analyticsLongs.textContent = portfolio.longs || 0;
    analyticsShorts.textContent = portfolio.shorts || 0;
    analyticsTotalPositions.textContent = portfolio.total_posicoes || 0;
}


function updateAnalysisMetrics(analysisData) {
    const analysis = analysisData.analise || {};
    const score = Number(analysis.atlas_score || 0);
    const scoreColor = getScoreColor(score);

    analyticsScore.textContent = score;
    analyticsScoreStatus.textContent =
        analysis.status_score || "NÃO INFORMADO";

    analyticsScoreRing.style.background =
        `conic-gradient(${scoreColor} ${score * 3.6}deg, #21334d 0deg)`;

    analyticsScoreDescription.textContent =
        `Risco atual: ${analysis.risco || "não informado"}. `
        + `Margem utilizada: ${formatNumber(analysis.percentual_margem)}%. `
        + `Exposição: ${formatNumber(analysis.percentual_exposicao)}%.`;
}


function updateEquityChart(snapshots) {
    const chartCanvas = document.getElementById("analytics-equity-chart");

    if (!chartCanvas) {
        return;
    }

    const labels = snapshots.map((snapshot) => {
        return new Date(snapshot.created_at).toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    });

    const values = snapshots.map((snapshot) => snapshot.patrimonio_total);

    if (equityChart) {
        equityChart.data.labels = labels;
        equityChart.data.datasets[0].data = values;
        equityChart.update();
        return;
    }

    equityChart = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Patrimônio",
                    data: values,
                    borderColor: "#4385ff",
                    backgroundColor: "rgba(67, 133, 255, 0.16)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#4385ff",
                    pointBorderColor: "#8bb4ff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: "#101a2b",
                    borderColor: "#294463",
                    borderWidth: 1,
                    titleColor: "#ffffff",
                    bodyColor: "#c7d8ef",
                    callbacks: {
                        label(context) {
                            return `US$ ${formatNumber(context.parsed.y)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#91a8c5",
                    },
                    grid: {
                        color: "rgba(72, 103, 143, 0.16)",
                    },
                },
                y: {
                    ticks: {
                        color: "#91a8c5",
                        callback(value) {
                            return `US$ ${formatNumber(value)}`;
                        },
                    },
                    grid: {
                        color: "rgba(72, 103, 143, 0.16)",
                    },
                },
            },
        },
    });
}


async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Falha ao consultar ${url}`);
    }

    return response.json();
}


async function loadAnalytics() {
    try {
        const [portfolio, trading, analysisData, historyData] = await Promise.all([
            fetchJson("/portfolio"),
            fetchJson("/trading"),
            fetchJson("/analysis"),
            fetchJson("/history"),
        ]);

        const snapshots = historyData.snapshots || [];

        updatePortfolioMetrics(portfolio, trading);
        updateAnalysisMetrics(analysisData);

        analyticsSnapshots.textContent = snapshots.length;

        updateEquityChart(snapshots);

        analyticsLastUpdate.textContent =
            `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
    } catch (error) {
        console.error(error);

        analyticsLastUpdate.textContent =
            "Não foi possível atualizar os dados.";
    }
}


updateClock();
setInterval(updateClock, 1000);

loadAnalytics();
setInterval(loadAnalytics, 15000);