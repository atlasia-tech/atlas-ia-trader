from fastapi import APIRouter

from app.core.config import settings
from app.services.alert_service import AlertService
from app.services.analysis_service import AnalysisService
from app.services.health_service import HealthService
from app.services.history_service import HistoryService
from app.services.market_service import MarketService
from app.services.okx_service import OKXService
from app.services.portfolio_service import PortfolioService
from app.services.timeline_service import TimelineService

router = APIRouter()


@router.get("/status")
def status():
    return {
        "status": "online",
        "bot": settings.APP_NAME,
    }


@router.get("/config")
def config():
    return {
        "api_configurada": bool(settings.OKX_API_KEY),
        "database": settings.DATABASE_URL,
    }


@router.get("/okx")
def testar_okx():
    okx = OKXService()
    return okx.testar_conexao()


@router.get("/ativos")
def ativos():
    okx = OKXService()
    return okx.listar_ativos()


@router.get("/trading")
def trading():
    okx = OKXService()
    return okx.saldo_trading()


@router.get("/posicoes")
def posicoes():
    okx = OKXService()
    return okx.posicoes_abertas()


@router.get("/portfolio")
def portfolio():
    portfolio_service = PortfolioService()
    history_service = HistoryService()
    okx = OKXService()

    dados = portfolio_service.resumo_posicoes()
    saldo = okx.saldo_trading()

    if "operacoes" in dados and "patrimonio_total" in saldo:
        history_service.registrar_snapshot(
            portfolio=dados,
            patrimonio_total=saldo["patrimonio_total"],
        )

    return dados


@router.get("/analysis")
def analysis():
    analysis_service = AnalysisService()
    return analysis_service.analisar()


@router.get("/alerts")
def alerts():
    alert_service = AlertService()
    return alert_service.listar_alertas()


@router.get("/history")
def history():
    history_service = HistoryService()

    return {
        "snapshots": history_service.listar_snapshots(),
    }


@router.get("/mercado")
def mercado():
    market_service = MarketService()

    return {
        "ativos": market_service.resumo_mercado(),
    }


@router.get("/health")
def health():
    health_service = HealthService()

    return health_service.status_geral()


@router.get("/timeline")
def timeline():
    timeline_service = TimelineService()

    timeline_service.criar_eventos_iniciais()

    return {
        "events": timeline_service.listar_eventos(),
    }