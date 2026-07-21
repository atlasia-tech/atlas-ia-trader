/* ==========================================================
   ATLAS OS — Dashboard
   Dados em tempo real e histórico de patrimônio
   ========================================================== */

const REFRESH_INTERVAL_MS = 20000;

const clock = document.getElementById("atlas-clock");
const lastUpdate = document.getElementById("last-update");
const positionsTable = document.getElementById("positions-table-body");
const lucroTotal = document.getElementById("lucro-total");
const chartCanvas = document.getElementById("equity-chart");
const chartPanelTitle = document.querySelector(".chart-panel h3");
const chartEmptyState = document.querySelector(".chart-empty-state");
const chartAction = document.querySelector(".chart-panel .panel-action");
const scoreRing = document.querySelector(".score-ring");
const scoreValue = document.querySelector(".score-ring span");
const scoreStatus = document.querySelector(".score-ring small");
const scoreDescription = document.querySelector(".score-content p");

let equityChart = null;

function formatNumber(value, decimals = 2) {
    return Number(value || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function updateClock() {
    if (!clock) return;

    clock.textContent = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date());
}

function updateLastRefresh() {
    if (!lastUpdate) return;

    const time = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date());

    lastUpdate.textContent = `Última atualização: ${time}`;
}

function setMetricCard(position, value) {
    const cards = document.querySelectorAll(".metric-card");
    const title = cards[position]?.querySelector("h2");

    if (title) {
        title.textContent = value;
    }
}

function updateMetrics(portfolio, analysis) {
    if (!portfolio) return;

    const lucro = Number(portfolio.lucro_total || 0);
    const patrimonio = Number(
        analysis?.resumo?.patrimonio_total || 0
    );

    if (patrimonio > 0) {
        setMetricCard(0, `US$ ${formatNumber(patrimonio)}`);
    }

    setMetricCard(1, `${formatNumber(lucro)} USDT`);
    setMetricCard(2, portfolio.longs || 0);
    setMetricCard(3, portfolio.shorts || 0);

    if (lucroTotal) {
        lucroTotal.classList.toggle("value-positive", lucro >= 0);
        lucroTotal.classList.toggle("value-negative", lucro < 0);
    }

    if (analysis?.analise?.risco) {
        setMetricCard(4, analysis.analise.risco);
    }
}

function getPnlClass(value) {
    return Number(value || 0) >= 0 ? "pnl-positive" : "pnl-negative";
}

function renderPositions(operations) {
    if (!positionsTable) return;

    if (!operations?.length) {
        positionsTable.innerHTML = `
            <tr class="table-empty-state">
                <td colspan="6">
                    <i class="bi bi-info-circle"></i>
                    Nenhuma posição aberta no momento.
                </td>
            </tr>
        `;
        return;
    }

    positionsTable.innerHTML = operations.map((operation) => {
        const pnl = Number(operation.lucro_prejuizo || 0);
        const roi = Number(operation.roi || 0);
        const sideClass = operation.lado === "LONG" ? "side-long" : "side-short";

        return `
            <tr>
                <td><strong>${operation.ativo}</strong></td>
                <td>
                    <span class="side-badge ${sideClass}">
                        ${operation.lado}
                    </span>
                </td>
                <td>${formatNumber(operation.entrada, 4)}</td>
                <td>${formatNumber(operation.preco_atual, 4)}</td>
                <td class="${getPnlClass(pnl)}">
                    ${pnl >= 0 ? "+" : ""}${formatNumber(pnl, 4)}
                </td>
                <td class="${getPnlClass(roi)}">
                    ${roi >= 0 ? "+" : ""}${formatNumber(roi, 2)}%
                </td>
            </tr>
        `;
    }).join("");
}

function renderScore(analysis) {
    if (!analysis?.analise || !scoreRing || !scoreValue || !scoreStatus) {
        return;
    }

    const { analise } = analysis;
    const score = Number(analise.atlas_score || 0);
    const status = analise.status_score || "INDISPONÍVEL";

    scoreValue.textContent = score;
    scoreStatus.textContent = status;

    let color = "#22c55e";

    if (score < 85 && score >= 65) {
        color = "#f59e0b";
    } else if (score < 65) {
        color = "#ef4444";
    }

    scoreRing.style.borderTopColor = color;
    scoreRing.style.borderRightColor = color;

    if (scoreDescription) {
        scoreDescription.textContent =
            `Margem usada: ${formatNumber(analise.percentual_margem)}%. ` +
            `Exposição: ${formatNumber(analise.percentual_exposicao)}%. ` +
            `Maior posição: ${analise.maior_exposicao?.ativo || "—"}.`;
    }
}

function renderAnalysis(analysis) {
    const aiPanel = document.querySelector(".ai-panel");

    if (!aiPanel || !analysis?.analise || !analysis?.resumo) {
        return;
    }

    const { analise, resumo } = analysis;
    const message = aiPanel.querySelector(".ai-message p:last-child");
    const insights = aiPanel.querySelector(".ai-insights");

    if (message) {
        message.textContent =
            `Score ${analise.atlas_score}/100: ${analise.status_score}. ` +
            `O risco atual é ${analise.risco.toLowerCase()}, com ` +
            `${formatNumber(analise.percentual_margem)}% do patrimônio usado como margem.`;
    }

    if (insights) {
        insights.innerHTML = `
            <div>
                <i class="bi bi-check-circle-fill"></i>
                <span>${resumo.total_posicoes} posições monitoradas; ${resumo.longs} long e ${resumo.shorts} short.</span>
            </div>
            <div>
                <i class="bi bi-pie-chart-fill"></i>
                <span>Exposição atual: ${formatNumber(analise.percentual_exposicao)}% do patrimônio.</span>
            </div>
            <div>
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>Maior atenção: ${analise.maior_prejuizo?.ativo || "—"}.</span>
            </div>
        `;
    }
}

function initializeChart() {
    if (!chartCanvas || typeof Chart === "undefined") return;

    equityChart = new Chart(chartCanvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Patrimônio total",
                data: [],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, .15)",
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#60a5fa",
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return ` Patrimônio: US$ ${formatNumber(context.raw, 2)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#94a3b8",
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    grid: {
                        color: "rgba(148, 163, 184, .12)",
                    },
                    ticks: {
                        color: "#94a3b8",
                        callback(value) {
                            return `US$ ${formatNumber(value, 2)}`;
                        },
                    },
                },
            },
        },
    });
}

function updateEquityChart(snapshots) {
    if (!equityChart || !snapshots?.length) return;

    const labels = snapshots.map((snapshot) => {
        const date = new Date(snapshot.created_at);

        return new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    });

    const values = snapshots.map((snapshot) =>
        Number(snapshot.patrimonio_total || 0)
    );

    equityChart.data.labels = labels;
    equityChart.data.datasets[0].data = values;
    equityChart.update();

    if (chartPanelTitle) {
        chartPanelTitle.textContent = "Curva do patrimônio";
    }

    if (chartAction) {
        chartAction.disabled = true;
        chartAction.innerHTML = `
            <i class="bi bi-database-check"></i>
            Histórico real
        `;
    }

    if (chartEmptyState) {
        chartEmptyState.style.display = "none";
    }
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Falha ao consultar ${url}`);
    }

    return response.json();
}

async function refreshDashboard() {
    try {
        const portfolio = await fetchJson("/portfolio");

        const [analysis, history] = await Promise.all([
            fetchJson("/analysis"),
            fetchJson("/history"),
        ]);

        updateMetrics(portfolio, analysis);
        renderPositions(portfolio.operacoes);
        renderScore(analysis);
        renderAnalysis(analysis);
        updateEquityChart(history.snapshots);
        updateLastRefresh();
    } catch (error) {
        console.warn("Atlas OS: atualização indisponível.", error);

        if (lastUpdate) {
            lastUpdate.textContent =
                "Última atualização: aguardando conexão com a API";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeChart();
    updateClock();
    refreshDashboard();

    window.setInterval(updateClock, 1000);
    window.setInterval(refreshDashboard, REFRESH_INTERVAL_MS);
});