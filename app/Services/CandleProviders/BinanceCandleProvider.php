<?php

namespace App\Services\CandleProviders;

use Illuminate\Support\Facades\Http;

class BinanceCandleProvider
{
    public function fetchCandles(string $symbol, string $interval): array
    {
        $mappedSymbol = $this->toBinanceSymbol($symbol);
        $mappedInterval = $this->toBinanceInterval($interval);

        logger()->info("Requesting Binance.US candles for $mappedSymbol @ $mappedInterval");

        $response = Http::get("https://api.binance.us/api/v3/klines", [
            'symbol' => $mappedSymbol,
            'interval' => $mappedInterval,
            'limit' => 200
        ]);

        logger()->info("Response body: " . $response->body());

        if (!$response->ok()) {
            logger()->error('Binance response: ' . $response->body());
            throw new \Exception("Binance API error");
        }

        return collect($response->json())->map(function ($candle) {
            return [
                'timestamp' => $candle[0],
                'open' => $candle[1],
                'high' => $candle[2],
                'low' => $candle[3],
                'close' => $candle[4],
                'volume' => $candle[5]
            ];
        })->toArray();
    }

    protected function toBinanceSymbol(string $symbol): string
    {
        if (str_ends_with($symbol, 'USDT')) {
            return strtoupper($symbol);
        }
    
        return str_replace('USD', 'USDT', strtoupper($symbol));
    }

    protected function toBinanceInterval(string $interval): string
    {
        return match ($interval) {
            '15m' => '15m',
            '1h' => '1h',
            '4h' => '4h',
            '1d' => '1d',
            default => throw new \Exception("Unsupported interval: $interval")
        };
    }
}
