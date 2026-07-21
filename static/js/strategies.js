const STRATEGIES_REFRESH_INTERVAL = 20000;

const clock = document.getElementById("atlas-clock");
const totalPositions = document.getElementById("strategy-total-positions");
const longs = document.getElementById("strategy-longs");
const shorts = document.getElementById("strategy-shorts");
const risk = document.getElementById("strategy-risk");
const score = document.getElementById("strategy-score");
const scoreStatus = document.getElementById("strategy-score-status");
const scoreRing = document.getElementById("strategy-score-ring");
const healthText = document.getElementById("strategy-health-text");
const lastUpdate = document.getElementById("strategies-last-update");

function updateClock() {
    if (!clock) {
        return;
    }

    clock.textContent = new Date().toLocaleTimeString("pt-BR");
}

function updateLastUpdate() {
    if (!lastUpdate) {
        return;
    }

    lastUpdate.textContent =
        `Última atualização: ${new Date().toLocaleTimeString("pt-BR")}`;
}

function updateScore(scoreValue, status) {
    const safeScore = Math.max(0, Math.min(100, Number(scoreValue) || 0));

    if (score) {
        score.textContent = safeScore;
    }

    if (scoreStatus) {
        scoreStatus.textContent = status || "INDISPONÍVEL";
    }

    if (scoreRing) {
        scoreRing.style.background =
            `conic-gradient(#2f80ed 0 ${safeScore}%, #243854 ${safeScore}% 100%)`;
    }
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar ${url}.`);
    }

    return response.json();
}

async function updateStrategies() {
    try {
        const [portfolio, analysis] = await Promise.all([
            fetchJson("/portfolio"),
            fetchJson("/analysis"),
        ]);

        const resumo = analysis.resumo || portfolio;
        const analise = analysis.analise || {};

        if (totalPositions) {
            totalPositions.textContent = resumo.total_posicoes ?? "—";
        }

        if (longs) {
            longs.textContent = resumo.longs ?? "—";
        }

        if (shorts) {
            shorts.textContent = resumo.shorts ?? "—";
        }

        if (risk) {
            risk.textContent = analise.risco || "—";
        }

        updateScore(analise.atlas_score, analise.status_score);

        if (healthText) {
            const margem = Number(analise.percentual_margem || 0).toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            );

            const exposicao = Number(
                analise.percentual_exposicao || 0,
            ).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            healthText.textContent =
                `Score ${analise.atlas_score || 0}/100: ` +
                `${analise.status_score || "INDISPONÍVEL"}. ` +
                `A operação atual utiliza ${margem}% do patrimônio em margem ` +
                `e ${exposicao}% em exposição.`;
        }

        updateLastUpdate();
    } catch (error) {
        console.error("Erro ao atualizar estratégias:", error);

        if (healthText) {
            healthText.textContent =
                "Não foi possível atualizar os dados neste momento.";
        }

        if (scoreStatus) {
            scoreStatus.textContent = "OFFLINE";
        }
    }
}

updateClock();
updateStrategies();

setInterval(updateClock, 1000);
setInterval(updateStrategies, STRATEGIES_REFRESH_INTERVAL);