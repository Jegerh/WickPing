<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use App\Services\CandleProviders\BinanceCandleProvider;
use App\Models\Wickping\ActiveCandleKey;

class CacheCandles extends Command
{
    protected $signature = 'signals:cache:candles {interval=1h}';
    protected $description = 'Cache candle data for active symbol/interval combinations';

    public function handle()
    {
        $interval = $this->argument('interval');
        $this->info("Caching candles for interval: $interval");

        $keys = ActiveCandleKey::where('interval', $interval)->pluck('symbol')->toArray();

        if (empty($keys)) {
            $this->warn("No active symbols for interval $interval.");
            return;
        }

        $provider = new BinanceCandleProvider();

        foreach ($keys as $symbol) {
            try {
                $candles = $provider->fetchCandles($symbol, $interval);

                $ttl = match ($interval) {
                    '15m' => now()->addMinutes(15),
                    '1h'  => now()->addHour(),
                    '4h'  => now()->addHours(4),
                    '1d'  => now()->addDay(),
                    default => now()->addMinutes(30),
                };

                Cache::put("candles:$symbol:$interval", [
                    'timestamp' => now()->toIso8601String(),
                    'candles' => $candles
                ], $ttl);  // TTL depends on interval

                $this->info("✅ Cached $symbol:$interval");
            } catch (\Exception $e) {
                $this->error("❌ Failed $symbol:$interval - " . $e->getMessage());
            }
        }
    }
}
