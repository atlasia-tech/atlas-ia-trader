from app.services.okx_service import OKXService


class PortfolioService:
    def __init__(self):
        self.okx = OKXService()

    def resumo_posicoes(self):
        resposta = self.okx.posicoes_abertas()

        if resposta["code"] != "0":
            return resposta

        posicoes = resposta["data"]

        resultado = {
            "total_posicoes": len(posicoes),
            "longs": 0,
            "shorts": 0,
            "lucro_total": 0.0,
            "exposicao_total": 0.0,
            "margem_utilizada": 0.0,
            "operacoes": [],
        }

        for posicao in posicoes:
            lucro = float(posicao["upl"]) if posicao["upl"] else 0.0
            roi = float(posicao["uplRatio"]) * 100 if posicao["uplRatio"] else 0.0
            valor_notional = (
                float(posicao["notionalUsd"])
                if posicao["notionalUsd"]
                else 0.0
            )
            margem_inicial = float(posicao["imr"]) if posicao["imr"] else 0.0

            if posicao["posSide"] == "long":
                resultado["longs"] += 1
            else:
                resultado["shorts"] += 1

            resultado["lucro_total"] += lucro
            resultado["exposicao_total"] += valor_notional
            resultado["margem_utilizada"] += margem_inicial

            resultado["operacoes"].append({
                "ativo": posicao["instId"],
                "lado": posicao["posSide"].upper(),
                "quantidade": float(posicao["pos"]),
                "entrada": float(posicao["avgPx"]),
                "preco_atual": float(posicao["markPx"]),
                "alavancagem": int(float(posicao["lever"])),
                "valor_notional": round(valor_notional, 4),
                "margem_inicial": round(margem_inicial, 4),
                "preco_liquidacao": (
                    float(posicao["liqPx"])
                    if posicao["liqPx"]
                    else None
                ),
                "lucro_prejuizo": round(lucro, 4),
                "roi": round(roi, 2),
            })

        resultado["lucro_total"] = round(resultado["lucro_total"], 4)
        resultado["exposicao_total"] = round(resultado["exposicao_total"], 4)
        resultado["margem_utilizada"] = round(resultado["margem_utilizada"], 4)

        return resultado