from okx import FundingClient, AccountClient

from app.core.config import settings


class OKXService:
    def __init__(self):
        self.funding = FundingClient(
            apikey=settings.OKX_API_KEY,
            apisecret=settings.OKX_SECRET_KEY,
            passphrase=settings.OKX_PASSPHRASE,
        )

        self.account = AccountClient(
            apikey=settings.OKX_API_KEY,
            apisecret=settings.OKX_SECRET_KEY,
            passphrase=settings.OKX_PASSPHRASE,
        )

    def testar_conexao(self):
        return self.funding.get_balances()

    def listar_ativos(self):
        resposta = self.funding.get_balances()

        if resposta["code"] != "0":
            return resposta

        ativos = []

        for ativo in resposta["data"]:
            ativos.append({
                "moeda": ativo["ccy"],
                "saldo": ativo["bal"],
                "disponivel": ativo["availBal"],
                "congelado": ativo["frozenBal"]
            })

        return ativos

    def saldo_trading(self):
        resposta = self.account.get_balance()

        if resposta["code"] != "0":
            return resposta

        conta = resposta["data"][0]

        resultado = {
            "patrimonio_total": float(conta["totalEq"]),
            "ativos": []
        }

        for ativo in conta["details"]:
            resultado["ativos"].append({
                "moeda": ativo["ccy"],
                "saldo": float(ativo["eq"]),
                "disponivel": float(ativo["availBal"]),
                "lucro_prejuizo": float(ativo["upl"]) if ativo["upl"] else 0.0
            })

        return resultado

    def posicoes_abertas(self):
        return self.account.get_positions()