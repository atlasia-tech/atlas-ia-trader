from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import router
from app.core.config import settings
from app.database.session import create_database


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
)

templates = Jinja2Templates(directory="templates")

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

app.include_router(router)

create_database()


@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    contexto = {
        "request": request,
        "patrimonio": "Carregando...",
        "lucro_total": "Carregando...",
        "longs": "—",
        "shorts": "—",
        "risco": "CARREGANDO",
    }

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context=contexto,
    )


@app.get("/operacoes", response_class=HTMLResponse)
def operacoes(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="operations.html",
        context={"request": request},
    )


@app.get("/mercados", response_class=HTMLResponse)
def mercados(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="market.html",
        context={"request": request},
    )


@app.get("/atlas-ai", response_class=HTMLResponse)
def atlas_ai(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="ai.html",
        context={"request": request},
    )


@app.get("/risco", response_class=HTMLResponse)
def risco(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="risk.html",
        context={"request": request},
    )


@app.get("/analytics", response_class=HTMLResponse)
def analytics(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="analytics.html",
        context={"request": request},
    )


@app.get("/mission-control", response_class=HTMLResponse)
def mission_control(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="mission_control.html",
        context={"request": request},
    )


@app.get("/estrategias", response_class=HTMLResponse)
def estrategias(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="strategies.html",
        context={"request": request},
    )


@app.get("/configuracoes", response_class=HTMLResponse)
def configuracoes(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="settings.html",
        context={"request": request},
    )


@app.get("/alertas", response_class=HTMLResponse)
def alertas(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="alerts.html",
        context={"request": request},
    )