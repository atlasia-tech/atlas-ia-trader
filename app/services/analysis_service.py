from app.services.okx_service import OKXService
from app.services.portfolio_service import PortfolioService


class AnalysisService:
    def __init__(self):
        self.okx = OKXService()
        self.portfolio = PortfolioService()

    def analisar(self):
        dados = self.portfolio.resumo_posicoes()
        saldo = self.okx.saldo_trading()

        if "operacoes" not in dados:
            return dados

        operacoes = dados["operacoes"]

        if not operacoes:
            return {
                "resumo": {
                    "total_posicoes": 0,
                    "longs": 0,
                    "shorts": 0,
                    "lucro_total": 0.0,
                    "exposicao_total": 0.0,
                    "margem_utilizada": 0.0,
                    "patrimonio_total": 0.0,
                },
                "analise": {
                    "risco": "BAIXO",
                    "atlas_score": 100,
                    "status_score": "SEM POSIÇÕES",
                    "maior_lucro": None,
                    "maior_prejuizo": None,
                    "maior_exposicao": None,
                    "percentual_margem": 0.0,
                    "percentual_exposicao": 0.0,
                    "concentracao_maior_posicao": 0.0,
                },
            }

        patrimonio_total = float(saldo.get("patrimonio_total", 0.0))
        margem_utilizada = dados["margem_utilizada"]
        exposicao_total = dados["exposicao_total"]
        lucro_total = dados["lucro_total"]

        percentual_margem = (
            (margem_utilizada / patrimonio_total) * 100
            if patrimonio_total > 0
            else 0.0
        )

        percentual_exposicao = (
            (exposicao_total / patrimonio_total) * 100
            if patrimonio_total > 0
            else 0.0
        )

        maior_lucro = max(
            operacoes,
            key=lambda operacao: operacao["lucro_prejuizo"],
        )

        maior_prejuizo = min(
            operacoes,
            key=lambda operacao: operacao["lucro_prejuizo"],
        )

        maior_exposicao = max(
            operacoes,
            key=lambda operacao: operacao["valor_notional"],
        )

        concentracao_maior_posicao = (
            (maior_exposicao["valor_notional"] / exposicao_total) * 100
            if exposicao_total > 0
            else 0.0
        )

        total_posicoes = dados["total_posicoes"]
        longs = dados["longs"]
        shorts = dados["shorts"]

        score = 100

        if percentual_margem > 10:
            score -= 30
        elif percentual_margem > 5:
            score -= 15
        elif percentual_margem > 2:
            score -= 5

        if percentual_exposicao > 80:
            score -= 25
        elif percentual_exposicao > 50:
            score -= 15
        elif percentual_exposicao > 30:
            score -= 8

        if concentracao_maior_posicao > 40:
            score -= 12
        elif concentracao_maior_posicao > 25:
            score -= 6

        if total_posicoes > 0:
            desequilibrio = abs(longs - shorts) / total_posicoes

            if desequilibrio > 0.6:
                score -= 15
            elif desequilibrio > 0.3:
                score -= 8

        prejuizo_percentual = (
            abs(lucro_total) / patrimonio_total * 100
            if lucro_total < 0 and patrimonio_total > 0
            else 0.0
        )

        if prejuizo_percentual > 3:
            score -= 20
        elif prejuizo_percentual > 1:
            score -= 10
        elif prejuizo_percentual > 0.5:
            score -= 5
        elif prejuizo_percentual > 0.25:
            score -= 3

        pior_roi = abs(maior_prejuizo["roi"])

        if pior_roi > 100:
            score -= 12
        elif pior_roi > 50:
            score -= 8
        elif pior_roi > 25:
            score -= 4

        score = max(0, min(100, round(score)))

        if score >= 85:
            risco = "BAIXO"
            status_score = "SAUDÁVEL"
        elif score >= 65:
            risco = "MODERADO"
            status_score = "ATENÇÃO"
        else:
            risco = "ALTO"
            status_score = "ELEVADO"

        return {
            "resumo": {
                "total_posicoes": total_posicoes,
                "longs": longs,
                "shorts": shorts,
                "lucro_total": lucro_total,
                "exposicao_total": exposicao_total,
                "margem_utilizada": margem_utilizada,
                "patrimonio_total": round(patrimonio_total, 2),
            },
            "analise": {
                "risco": risco,
                "atlas_score": score,
                "status_score": status_score,
                "maior_lucro": maior_lucro,
                "maior_prejuizo": maior_prejuizo,
                "maior_exposicao": maior_exposicao,
                "percentual_margem": round(percentual_margem, 2),
                "percentual_exposicao": round(percentual_exposicao, 2),
                "concentracao_maior_posicao": round(
                    concentracao_maior_posicao,
                    2,
                ),
            },
        }