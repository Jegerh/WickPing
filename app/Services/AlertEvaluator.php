<?php

namespace App\Services;

use App\Models\Wickping\Alert;
use Illuminate\Support\Facades\Log;
use App\Services\CandleAggregator;
use Illuminate\Support\Facades\Cache;

class AlertEvaluator
{
    
    protected CandleAggregator $aggregator;

    public function __construct()
    {
        $this->aggregator = new CandleAggregator();
    }
    
    public function run(): void
    {
        $alerts = Alert::where('status', 'active')->get();
    
        if ($alerts->isEmpty()) {
            Log::info('No active alerts to evaluate.');
            return;
        }
    
        $evaluator = new \App\Services\AlertEvaluator();
    
        foreach ($alerts as $alert) {
            Log::info("Evaluating alert #{$alert->id}: {$alert->name}");
    
            if ($evaluator->evaluate($alert)) {
                Log::info("🔥 Alert #{$alert->id} would TRIGGER!");
            } else {
                Log::info("➖ Alert #{$alert->id} does not match.");
            }
        }
    }
    

    protected function evaluateWorkflow(array $workflow): bool
    {
        if (!isset($workflow['rootGroup'])) {
            return false;
        }

        return $this->evaluateGroup($workflow['rootGroup']);
    }

    protected function evaluateGroup(array $group): bool
    {
        $type = strtoupper($group['type'] ?? 'AND');
        $results = [];

        logger("before foreach blocks");
        logger("blocks:".count($group['blocks']));

        foreach ($group['blocks'] ?? [] as $block) {
            logger("before evaluateSignal");
            $results[] = $this->evaluateSignal($block);
        }

        foreach ($group['groups'] ?? [] as $nested) {
            $results[] = $this->evaluateGroup($nested);
        }

        return $type === 'AND' ? !in_array(false, $results, true) : in_array(true, $results, true);
    }

    protected function evaluateSignal(array $signal): bool
    {
        $config = $signal['config'] ?? [];
        $type = $signal['type'] ?? '';
    
        if ($type === 'indicator' && ($config['indicator'] ?? '') === 'ma') {
            $symbol = strtoupper($config['symbol'] ?? 'BTCUSDT');
            $interval = $config['interval'] ?? '1h';
            $period = (int) ($config['period'] ?? 50);
            $condition = $config['condition'] ?? 'price_above_ma';
    
            $raw = Cache::get("candles:$symbol:15m")['candles'] ?? [];
            logger("🕯️ Raw 15m count: " . count($raw));
    
            if (count($raw) < max(100, $period * 4)) {
                logger("⛔ Not enough 15m candles for $symbol to evaluate MA$period");
                return false;
            }
    
            $candles = $this->aggregator->aggregate($raw, $interval);
            logger("📏 Aggregated {$interval} candle count: " . count($candles));
    
            $closes = array_map(fn($c) => (float) $c['close'], $candles);
            logger("🧮 Closes available: " . count($closes) . " (needed: $period)");
    
            if (count($closes) < $period + 1) {
                return false;
            }
    
            // Slice from the end
            $recentCloses = array_slice($closes, -$period);
            $prevCloses = array_slice($closes, -($period + 1), $period);
    
            $ma = array_sum($recentCloses) / count($recentCloses);
            $prevMa = array_sum($prevCloses) / count($prevCloses);
    
            $latestPrice = end($closes);
            $prevPrice = $closes[count($closes) - 2];
    
            // ➕ Additional MAs for dual MA comparisons
            $fastPeriod = (int) ($config['fast'] ?? 9);
            $slowPeriod = (int) ($config['slow'] ?? 21);
    
            $fastCloses = array_slice($closes, -$fastPeriod);
            $prevFastCloses = array_slice($closes, -($fastPeriod + 1), $fastPeriod);
    
            $slowCloses = array_slice($closes, -$slowPeriod);
            $prevSlowCloses = array_slice($closes, -($slowPeriod + 1), $slowPeriod);
    
            $fastMa = array_sum($fastCloses) / count($fastCloses);
            $prevFastMa = array_sum($prevFastCloses) / count($prevFastCloses);
    
            $slowMa = array_sum($slowCloses) / count($slowCloses);
            $prevSlowMa = array_sum($prevSlowCloses) / count($prevSlowCloses);
    
            logger("📊 $symbol | $condition | Price: $latestPrice | MA: $ma | FastMA: $fastMa | SlowMA: $slowMa");
    
            return match ($condition) {
                'price_above_ma'      => $latestPrice > $ma && $prevPrice <= $prevMa,
                'price_below_ma'      => $latestPrice < $ma && $prevPrice >= $prevMa,
                'ma_fast_above_slow'  => $fastMa > $slowMa && $prevFastMa <= $prevSlowMa,
                'ma_fast_below_slow'  => $fastMa < $slowMa && $prevFastMa >= $prevSlowMa,
                default               => false,
            };
        }
    
        return false;
    }
    
    public function evaluate(Alert $alert): bool
    {
        return $this->evaluateWorkflow($alert->workflow);
    }
    
}
