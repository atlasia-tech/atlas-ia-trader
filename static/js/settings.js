const SETTINGS_REFRESH_INTERVAL = 30000;

const clock = document.getElementById("atlas-clock");
const apiKey = document.getElementById("setting-api-key");
const okxStatus = document.getElementById("setting-okx-status");
const apiStatus = document.getElementById("setting-api-status");
const databaseStatus = document.getElementById("setting-database-status");
const aiStatus = document.getElementById("setting-ai-status");
const lastUpdate = document.getElementById("settings-last-update");

function updateClock() {
    if (clock) {
        clock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}

function setStatus(element, online, onlineText = "Online") {
    if (!element) {
        return;
    }

    element.classList.remove("setting-value-safe", "setting-value-danger");

    if (online) {
        element.classList.add("setting-value-safe");
        element.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${onlineText}`;
    } else {
        element.classList.add("setting-value-danger");
        element.innerHTML = '<i class="bi bi-x-circle-fill"></i> Indisponível';
    }
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar ${url}.`);
    }

    return response.json();
}

async function updateSettings() {
    try {
        const [config, health] = await Promise.all([
            fetchJson("/config"),
            fetchJson("/health"),
        ]);

        setStatus(
            apiKey,
            Boolean(config.api_configurada),
            "Configurada",
        );

        setStatus(okxStatus, Boolean(health.okx?.online));
        setStatus(apiStatus, Boolean(health.api?.online));
        setStatus(databaseStatus, Boolean(health.database?.online));
        setStatus(aiStatus, Boolean(health.atlas_ai?.online));

        if (lastUpdate) {
            lastUpdate.textContent =
                `Última atualização: ${new Date().toLocaleTimeString("pt-BR")}`;
        }
    } catch (error) {
        console.error("Erro ao atualizar configurações:", error);

        setStatus(apiKey, false);
        setStatus(okxStatus, false);
        setStatus(apiStatus, false);
        setStatus(databaseStatus, false);
        setStatus(aiStatus, false);
    }
}

updateClock();
updateSettings();

setInterval(updateClock, 1000);
setInterval(updateSettings, SETTINGS_REFRESH_INTERVAL);