from datetime import datetime, timezone

from sqlalchemy import func, select, text

from app.database.session import SessionLocal
from app.models.equity_snapshot import EquitySnapshot
from app.services.okx_service import OKXService


class HealthService:
    def verificar_banco(self) -> dict:
        session = SessionLocal()

        try:
            session.execute(text("SELECT 1"))

            total_snapshots = session.scalar(
                select(func.count()).select_from(EquitySnapshot)
            )

            return {
                "online": True,
                "snapshots": total_snapshots or 0,
            }
        except Exception as error:
            return {
                "online": False,
                "erro": str(error),
                "snapshots": 0,
            }
        finally:
            session.close()

    def verificar_okx(self) -> dict:
        try:
            resposta = OKXService().testar_conexao()

            return {
                "online": resposta.get("code") == "0",
            }
        except Exception as error:
            return {
                "online": False,
                "erro": str(error),
            }

    def status_geral(self) -> dict:
        banco = self.verificar_banco()
        okx = self.verificar_okx()

        return {
            "api": {
                "online": True,
            },
            "database": banco,
            "okx": okx,
            "atlas_ai": {
                "online": True,
            },
            "atualizado_em": datetime.now(timezone.utc).isoformat(),
        }