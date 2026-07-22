from app.services.analysis_service import AnalysisService


class AlertService:
    def listar_alertas(self):
        dados = AnalysisService().analisar()

        resumo = dados.get("resumo", {})
        analise = dados.get("analise", {})

        alertas = []

        risco = str(analise.get("risco", "NÃO INFORMADO")).upper()
        margem = float(analise.get("percentual_margem", 0) or 0)
        exposicao = float(analise.get("percentual_exposicao", 0) or 0)
        concentracao = float(
            analise.get("concentracao_maior_posicao", 0) or 0
        )

        maior_prejuizo = analise.get("maior_prejuizo") or {}
        maior_exposicao = analise.get("maior_exposicao") or {}

        alertas.append({
            "level": "success" if risco == "BAIXO" else "warning",
            "title": f"Risco operacional: {risco}",
            "description": (
                "A leitura atual considera margem, exposição, concentração "
                "e posições abertas."
            ),
        })

        if margem >= 5:
            alertas.append({
                "level": "warning",
                "title": "Margem utilizada merece atenção",
                "description": (
                    f"A margem atual é de {margem:.2f}% do patrimônio."
                ),
            })
        else:
            alertas.append({
                "level": "success",
                "title": "Margem em nível controlado",
                "description": (
                    f"A margem atual utiliza {margem:.2f}% do patrimônio."
                ),
            })

        if exposicao >= 50:
            alertas.append({
                "level": "warning",
                "title": "Exposição total elevada",
                "description": (
                    f"As posições representam {exposicao:.2f}% do patrimônio."
                ),
            })
        else:
            alertas.append({
                "level": "info",
                "title": "Exposição monitorada",
                "description": (
                    f"As posições representam {exposicao:.2f}% do patrimônio."
                ),
            })

        ativo_concentrado = maior_exposicao.get("ativo", "Não identificado")

        if concentracao >= 25:
            alertas.append({
                "level": "warning",
                "title": "Concentração relevante em uma posição",
                "description": (
                    f"{ativo_concentrado} representa {concentracao:.2f}% "
                    "da exposição atual."
                ),
            })
        else:
            alertas.append({
                "level": "info",
                "title": "Concentração distribuída",
                "description": (
                    f"A maior posição é {ativo_concentrado}, com "
                    f"{concentracao:.2f}% da exposição."
                ),
            })

        prejuizo = float(maior_prejuizo.get("lucro_prejuizo", 0) or 0)
        ativo_prejuizo = maior_prejuizo.get("ativo", "Não identificado")

        if prejuizo < -1:
            alertas.append({
                "level": "warning",
                "title": "Posição com maior perda em aberto",
                "description": (
                    f"{ativo_prejuizo} apresenta P/L de "
                    f"{prejuizo:.2f} USDT."
                ),
            })

        if not alertas:
            alertas.append({
                "level": "info",
                "title": "Sem alertas no momento",
                "description": (
                    f"{resumo.get('total_posicoes', 0)} posições estão "
                    "em monitoramento informativo."
                ),
            })

        return {
            "mode": "informational",
            "total_alertas": len(alertas),
            "alertas": alertas,
        }