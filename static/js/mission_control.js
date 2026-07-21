const missionClock = document.getElementById("mission-clock");

const missionTitle = document.getElementById("mission-title");
const missionDescription = document.getElementById("mission-description");
const missionOverallStatus = document.getElementById("mission-overall-status");

const missionApiStatus = document.getElementById("mission-api-status");
const missionDatabaseStatus = document.getElementById("mission-database-status");
const missionOkxStatus = document.getElementById("mission-okx-status");
const missionAiStatus = document.getElementById("mission-ai-status");

const missionSnapshots = document.getElementById("mission-snapshots");
const missionTimeline = document.getElementById("mission-timeline");
const missionLastUpdate = document.getElementById("mission-last-update");


function updateClock() {
    if (missionClock) {
        missionClock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}


function serviceStatusElement(element, online) {
    element.textContent = online ? "Online" : "Indisponível";
    element.className = `service-status ${online ? "online" : "offline"}`;
}


function createTimelineItem(title, description, online) {
    return `
        <article class="mission-timeline-item">
            <span class="timeline-dot ${online ? "online" : "offline"}"></span>

            <div>
                <strong>${title}</strong>
                <p>${description}</p>
            </div>
        </article>
    `;
}


function renderHealth(data) {
    const apiOnline = Boolean(data.api?.online);
    const databaseOnline = Boolean(data.database?.online);
    const okxOnline = Boolean(data.okx?.online);
    const aiOnline = Boolean(data.atlas_ai?.online);

    const allOnline = apiOnline && databaseOnline && okxOnline && aiOnline;

    serviceStatusElement(missionApiStatus, apiOnline);
    serviceStatusElement(missionDatabaseStatus, databaseOnline);
    serviceStatusElement(missionOkxStatus, okxOnline);
    serviceStatusElement(missionAiStatus, aiOnline);

    missionSnapshots.textContent = data.database?.snapshots || 0;

    missionOverallStatus.textContent = allOnline
        ? "SISTEMA ONLINE"
        : "ATENÇÃO NECESSÁRIA";

    missionOverallStatus.className =
        `mission-overall-status ${allOnline ? "online" : "offline"}`;

    missionTitle.textContent = allOnline
        ? "Todos os serviços essenciais estão online"
        : "Um ou mais serviços precisam de atenção";

    missionDescription.textContent = allOnline
        ? "A infraestrutura local, Atlas AI e conexão de leitura com a OKX estão funcionando."
        : "Verifique os serviços indicados como indisponíveis antes de continuar.";

    missionTimeline.innerHTML = [
        createTimelineItem(
            "API FastAPI",
            apiOnline
                ? "Rotas e interface respondendo normalmente."
                : "A API não respondeu à verificação.",
            apiOnline
        ),
        createTimelineItem(
            "Banco de dados",
            databaseOnline
                ? `${data.database?.snapshots || 0} snapshots disponíveis no histórico local.`
                : "Não foi possível consultar o banco local.",
            databaseOnline
        ),
        createTimelineItem(
            "Conexão OKX",
            okxOnline
                ? "Leitura da Trading Account autorizada e disponível."
                : "Não foi possível consultar a conexão com a OKX.",
            okxOnline
        ),
        createTimelineItem(
            "Atlas AI",
            aiOnline
                ? "Módulo de análise operacional disponível."
                : "O módulo Atlas AI não está disponível.",
            aiOnline
        ),
    ].join("");

    missionLastUpdate.textContent =
        `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
}


async function loadMissionControl() {
    try {
        const response = await fetch("/health");

        if (!response.ok) {
            throw new Error("Não foi possível verificar a infraestrutura.");
        }

        const data = await response.json();

        renderHealth(data);
    } catch (error) {
        console.error(error);

        missionTitle.textContent = "Não foi possível consultar a infraestrutura";
        missionDescription.textContent =
            "A verificação local do Mission Control falhou.";

        missionOverallStatus.textContent = "INDISPONÍVEL";
        missionOverallStatus.className = "mission-overall-status offline";
    }
}


updateClock();
setInterval(updateClock, 1000);

loadMissionControl();
setInterval(loadMissionControl, 30000);