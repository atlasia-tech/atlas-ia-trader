from sqlalchemy import desc, select

from app.database.session import SessionLocal
from app.models.system_event import SystemEvent


class TimelineService:
    def registrar_evento(
        self,
        source: str,
        title: str,
        description: str,
        level: str = "info",
    ) -> None:
        session = SessionLocal()

        try:
            event = SystemEvent(
                source=source,
                title=title,
                description=description,
                level=level,
            )

            session.add(event)
            session.commit()
        finally:
            session.close()

    def listar_eventos(self, limit: int = 20) -> list[dict]:
        session = SessionLocal()

        try:
            statement = (
                select(SystemEvent)
                .order_by(desc(SystemEvent.created_at))
                .limit(limit)
            )

            eventos = session.scalars(statement).all()

            return [
                {
                    "id": event.id,
                    "source": event.source,
                    "title": event.title,
                    "description": event.description,
                    "level": event.level,
                    "created_at": event.created_at.isoformat(),
                }
                for event in eventos
            ]
        finally:
            session.close()

    def criar_eventos_iniciais(self) -> None:
        if self.listar_eventos(limit=1):
            return

        self.registrar_evento(
            source="atlas",
            title="Atlas OS iniciado",
            description="Serviços locais iniciados em modo informativo.",
            level="success",
        )

        self.registrar_evento(
            source="api",
            title="API FastAPI online",
            description="Rotas e interface local disponíveis.",
            level="success",
        )

        self.registrar_evento(
            source="database",
            title="Banco de dados disponível",
            description="Histórico local de snapshots conectado.",
            level="success",
        )

        self.registrar_evento(
            source="okx",
            title="Conexão OKX monitorada",
            description="Canal de leitura da Trading Account disponível.",
            level="success",
        )