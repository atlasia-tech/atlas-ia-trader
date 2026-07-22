from datetime import datetime, timezone

from sqlalchemy import desc, select

from app.database.session import SessionLocal
from app.models.equity_snapshot import EquitySnapshot
from app.services.timeline_service import TimelineService


class HistoryService:
    def registrar_snapshot(self, portfolio, patrimonio_total):
        session = SessionLocal()

        try:
            ultimo_snapshot = session.scalar(
                select(EquitySnapshot)
                .order_by(desc(EquitySnapshot.created_at))
                .limit(1)
            )

            agora = datetime.now(timezone.utc)

            if ultimo_snapshot:
                horario_ultimo = ultimo_snapshot.created_at

                if horario_ultimo.tzinfo is None:
                    horario_ultimo = horario_ultimo.replace(
                        tzinfo=timezone.utc
                    )

                segundos_desde_ultimo = (
                    agora - horario_ultimo
                ).total_seconds()

                if segundos_desde_ultimo < 60:
                    return False

            lucro_atual = float(portfolio["lucro_total"])
            lucro_anterior = (
                float(ultimo_snapshot.lucro_total)
                if ultimo_snapshot
                else None
            )

            snapshot = EquitySnapshot(
                patrimonio_total=float(patrimonio_total),
                lucro_total=lucro_atual,
                margem_utilizada=float(portfolio["margem_utilizada"]),
                exposicao_total=float(portfolio["exposicao_total"]),
            )

            session.add(snapshot)
            session.commit()

            self._registrar_evento_relevante(
                lucro_anterior=lucro_anterior,
                lucro_atual=lucro_atual,
            )

            return True

        finally:
            session.close()

    def _registrar_evento_relevante(
        self,
        lucro_anterior,
        lucro_atual,
    ):
        timeline = TimelineService()

        if lucro_anterior is None:
            timeline.registrar_evento(
                source="portfolio",
                title="Histórico de patrimônio iniciado",
                description=(
                    f"Primeiro snapshot salvo com P/L em aberto de "
                    f"US$ {lucro_atual:.2f}."
                ),
                level="info",
            )
            return

        variacao = lucro_atual - lucro_anterior

        if abs(variacao) < 0.50:
            return

        if variacao > 0:
            timeline.registrar_evento(
                source="portfolio",
                title="Resultado aberto melhorou",
                description=(
                    f"O P/L em aberto variou +US$ {variacao:.2f}, "
                    f"chegando a US$ {lucro_atual:.2f}."
                ),
                level="success",
            )
            return

        timeline.registrar_evento(
            source="portfolio",
            title="Resultado aberto recuou",
            description=(
                f"O P/L em aberto variou US$ {variacao:.2f}, "
                f"chegando a US$ {lucro_atual:.2f}."
            ),
            level="warning",
        )

    def listar_snapshots(self, limite=120):
        session = SessionLocal()

        try:
            snapshots = session.scalars(
                select(EquitySnapshot)
                .order_by(desc(EquitySnapshot.created_at))
                .limit(limite)
            ).all()

            snapshots.reverse()

            resultado = []

            for snapshot in snapshots:
                created_at = snapshot.created_at

                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)

                resultado.append({
                    "patrimonio_total": snapshot.patrimonio_total,
                    "lucro_total": snapshot.lucro_total,
                    "margem_utilizada": snapshot.margem_utilizada,
                    "exposicao_total": snapshot.exposicao_total,
                    "created_at": created_at.isoformat(),
                })

            return resultado

        finally:
            session.close()