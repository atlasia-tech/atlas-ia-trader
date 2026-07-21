const MISSION_REFRESH_INTERVAL = 30000;

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

function setStatus(element, online) {
    if (!element) {
        return;
    }

    element.classList.remove("online", "offline");
    element.classList.add(online ? "online" : "offline");
    element.textContent = online ? "Online" : "Indisponível";
}

function formatTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "--:--:--";
    }

    return date.toLocaleTimeString("pt-BR");
}

function sourceName(source) {
    const names = {
        atlas: "Atlas OS",
        api: "API FastAPI",
        database: "Banco de dados",
        okx: "Conexão OKX",
        ai: "Atlas AI",
    };

    return names[source] || "Sistema";
}

function renderTimeline(events) {
    if (!missionTimeline) {
        return;
    }

    missionTimeline.replaceChildren();

    if (!events || events.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "mission-loading";
        emptyState.textContent = "Nenhum evento registrado ainda.";
        missionTimeline.appendChild(emptyState);
        return;
    }

    events.forEach((event) => {
        const item = document.createElement("article");
        item.className = `mission-event mission-event-${event.level || "info"}`;

        const dot = document.createElement("span");
        dot.className = "mission-event-dot";

        const content = document.createElement("div");
        content.className = "mission-event-content";

        const title = document.createElement("strong");
        title.textContent = event.title;

        const description = document.createElement("p");
        description.textContent = event.description;

        const metadata = document.createElement("small");
        metadata.textContent =
            `${sourceName(event.source)} · ${formatTime(event.created_at)}`;

        content.append(title, description, metadata);
        item.append(dot, content);
        missionTimeline.appendChild(item);
    });
}

function updateOverallStatus(health) {
    const services = [
        health.api?.online,
        health.database?.online,
        health.okx?.online,
        health.atlas_ai?.online,
    ];

    const allOnline = services.every(Boolean);

    if (missionOverallStatus) {
        missionOverallStatus.textContent = allOnline
            ? "SISTEMA ONLINE"
            : "ATENÇÃO";

        missionOverallStatus.classList.toggle("online", allOnline);
        missionOverallStatus.classList.toggle("offline", !allOnline);
    }

    if (missionTitle) {
        missionTitle.textContent = allOnline
            ? "Todos os serviços essenciais estão online"
            : "Um ou mais serviços precisam de atenção";
    }

    if (missionDescription) {
        missionDescription.textContent = allOnline
            ? "A infraestrutura local, Atlas AI e conexão de leitura com a OKX estão funcionando."
            : "O Atlas continua em modo informativo. Verifique os serviços destacados abaixo.";
    }
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Não foi possível carregar ${url}.`);
    }

    return response.json();
}

async function updateMissionControl() {
    try {
        const [health, timeline] = await Promise.all([
            fetchJson("/health"),
            fetchJson("/timeline"),
        ]);

        setStatus(missionApiStatus, Boolean(health.api?.online));
        setStatus(missionDatabaseStatus, Boolean(health.database?.online));
        setStatus(missionOkxStatus, Boolean(health.okx?.online));
        setStatus(missionAiStatus, Boolean(health.atlas_ai?.online));

        if (missionSnapshots) {
            missionSnapshots.textContent = health.database?.snapshots ?? "0";
        }

        updateOverallStatus(health);
        renderTimeline(timeline.events);

        if (missionLastUpdate) {
            missionLastUpdate.textContent =
                `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
        }
    } catch (error) {
        console.error("Erro ao atualizar Mission Control:", error);

        setStatus(missionApiStatus, false);
        setStatus(missionDatabaseStatus, false);
        setStatus(missionOkxStatus, false);
        setStatus(missionAiStatus, false);

        if (missionTitle) {
            missionTitle.textContent = "Não foi possível atualizar a infraestrutura";
        }

        if (missionDescription) {
            missionDescription.textContent =
                "A tela permanece informativa; tente atualizar novamente em instantes.";
        }

        if (missionOverallStatus) {
            missionOverallStatus.textContent = "OFFLINE";
            missionOverallStatus.classList.remove("online");
            missionOverallStatus.classList.add("offline");
        }
    }
}

updateClock();
updateMissionControl();

setInterval(updateClock, 1000);
setInterval(updateMissionControl, MISSION_REFRESH_INTERVAL);