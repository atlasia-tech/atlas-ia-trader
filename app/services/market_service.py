import requests


class MarketService:
    BASE_URL = "https://www.okx.com/api/v5/market/ticker"

    def buscar_ticker(self, ativo: str) -> dict:
        resposta = requests.get(
            self.BASE_URL,
            params={"instId": ativo},
            timeout=10,
        )
        resposta.raise_for_status()

        dados = resposta.json()

        if dados.get("code") != "0" or not dados.get("data"):
            raise ValueError(f"Não foi possível obter dados de {ativo}.")

        ticker = dados["data"][0]

        ultimo_preco = float(ticker["last"])
        preco_abertura_24h = float(ticker["sodUtc8"])

        variacao_24h = 0.0

        if preco_abertura_24h:
            variacao_24h = (
                (ultimo_preco - preco_abertura_24h)
                / preco_abertura_24h
            ) * 100

        return {
            "ativo": ativo,
            "ultimo_preco": ultimo_preco,
            "preco_abertura_24h": preco_abertura_24h,
            "variacao_24h": round(variacao_24h, 2),
            "maxima_24h": float(ticker["high24h"]),
            "minima_24h": float(ticker["low24h"]),
            "volume_24h": float(ticker["volCcy24h"]),
        }

    def resumo_mercado(self) -> list[dict]:
        ativos = [
            "BTC-USDT-SWAP",
            "ETH-USDT-SWAP",
            "SOL-USDT-SWAP",
            "XRP-USDT-SWAP",
        ]

        return [self.buscar_ticker(ativo) for ativo in ativos]