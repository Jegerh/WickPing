<?php

namespace App\Services;

class CandleAggregator
{
    /**
     * Supported intervals and how many 15m candles they require.
     */
    protected array $groupSizes = [
        '15m' => 1,
        '30m' => 2,
        '1h'  => 4,
        '4h'  => 16,
        '1d'  => 96,
    ];

    /**
     * Aggregate raw 15m candles into a higher interval.
     *
     * @param array $candles15m  Array of raw 15m candles (ordered oldest to newest)
     * @param string $targetInterval Target interval: '30m', '1h', '4h', '1d'
     * @return array Aggregated candles
     */
    public function aggregate(array $candles15m, string $targetInterval): array
    {
        if (!isset($this->groupSizes[$targetInterval])) {
            throw new \InvalidArgumentException("Unsupported interval: $targetInterval");
        }

        $groupSize = $this->groupSizes[$targetInterval];
        $result = [];

        // Group and aggregate
        for ($i = 0; $i <= count($candles15m) - $groupSize; $i += $groupSize) {
            $group = array_slice($candles15m, $i, $groupSize);

            $open = $group[0]['open'];
            $close = end($group)['close'];
            $high = max(array_column($group, 'high'));
            $low = min(array_column($group, 'low'));
            $volume = array_sum(array_map(fn($c) => (float) $c['volume'], $group));
            $timestamp = $group[0]['timestamp'];

            $result[] = compact('timestamp', 'open', 'high', 'low', 'close', 'volume');
        }

        return $result;
    }
}
