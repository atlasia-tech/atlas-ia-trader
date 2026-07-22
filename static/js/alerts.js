const alertsClock = document.getElementById("alerts-clock");
const alertsSummary = document.getElementById("alerts-summary");
const alertsDescription = document.getElementById("alerts-description");
const alertsCount = document.getElementById("alerts-count");
const alertsList = document.getElementById("alerts-list");
const alertsLastUpdate = document.getElementById("alerts-last-update");


function updateClock() {
    if (alertsClock) {
        alertsClock.textContent = new Date().toLocaleTimeString("pt-BR");
    }
}


function getAlertIcon(level) {
    const icons = {
        success: "bi-check-circle-fill",
        warning: "bi-exclamation-triangle-fill",
        danger: "bi-x-octagon-fill",
        info: "bi-info-circle-fill",
    };

    return icons[level] || icons.info;
}


function getAlertLabel(level) {
    const labels = {
        success: "Controlado",
        warning: "Atenção",
        danger: "Crítico",
        info: "Monitoramento",
    };

    return labels[level] || labels.info;
}


function renderAlerts(data) {
    const alerts = data.alertas || [];

    const warnings = alerts.filter(
        (alert) => alert.level === "warning" || alert.level === "danger"
    ).length;

    const total = Number(data.total_alertas || alerts.length || 0);

    if (warnings > 0) {
        alertsSummary.textContent =
            `${warnings} alerta${warnings > 1 ? "s" : ""} requerem atenção`;

        alertsDescription.textContent =
            "O Atlas identificou pontos informativos para acompanhamento. "
            + "Nenhuma ordem é executada por este painel.";
    } else {
        alertsSummary.textContent =
            "Nenhum alerta crítico identificado";

        alertsDescription.textContent =
            "Os indicadores atuais estão dentro dos níveis definidos "
            + "para monitoramento informativo.";
    }

    alertsCount.textContent = `${total} ativo${total !== 1 ? "s" : ""}`;

    alertsList.innerHTML = "";

    if (!alerts.length) {
        alertsList.innerHTML = `
            <div class="alerts-empty">
                <i class="bi bi-check-circle-fill"></i>
                Nenhum alerta disponível no momento.
            </div>
        `;
        return;
    }

    alerts.forEach((alert) => {
        const level = alert.level || "info";

        const item = document.createElement("article");
        item.className = `alert-item alert-${level}`;

        item.innerHTML = `
            <div class="alert-icon">
                <i class="bi ${getAlertIcon(level)}"></i>
            </div>

            <div class="alert-content">
                <div class="alert-title-row">
                    <strong>${alert.title || "Alerta operacional"}</strong>
                    <span>${getAlertLabel(level)}</span>
                </div>

                <p>${alert.description || "Sem detalhes disponíveis."}</p>
            </div>
        `;

        alertsList.appendChild(item);
    });

    alertsLastUpdate.textContent =
        `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
}


async function loadAlerts() {
    try {
        const response = await fetch("/alerts");

        if (!response.ok) {
            throw new Error("Não foi possível carregar os alertas.");
        }

        const data = await response.json();

        renderAlerts(data);
    } catch (error) {
        console.error(error);

        alertsSummary.textContent =
            "Alertas temporariamente indisponíveis";

        alertsDescription.textContent =
            "Não foi possível consultar os dados atuais da operação.";

        alertsCount.textContent = "Erro";

        alertsList.innerHTML = `
            <div class="alerts-empty alerts-error">
                <i class="bi bi-exclamation-triangle-fill"></i>
                Não foi possível carregar os alertas agora.
            </div>
        `;
    }
}


updateClock();
setInterval(updateClock, 1000);

loadAlerts();
setInterval(loadAlerts, 15000);