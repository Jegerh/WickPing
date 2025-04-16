<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Wickping\Alert;
use Illuminate\Support\Facades\Log;

class EvaluateAlerts extends Command
{
    protected $signature = 'alerts:evaluate';
    protected $description = 'Evaluate active alerts and determine if they should trigger';

    public function handle()
    {
        $this->info("Evaluating alerts via AlertEvaluator...");
        app(\App\Services\AlertEvaluator::class)->run();
    }

    protected function evaluateWorkflow(array $workflow): bool
    {
        if (!isset($workflow['rootGroup'])) return false;

        return $this->evaluateGroup($workflow['rootGroup']);
    }

    protected function evaluateGroup(array $group): bool
    {
        $type = strtoupper($group['type'] ?? 'AND');
        $results = [];

        // Evaluate each signal block
        foreach ($group['blocks'] ?? [] as $block) {
            $results[] = $this->evaluateSignal($block);
        }

        // Evaluate nested groups recursively
        foreach ($group['groups'] ?? [] as $nested) {
            $results[] = $this->evaluateGroup($nested);
        }

        return $type === 'AND' ? !in_array(false, $results, true) : in_array(true, $results, true);
    }

    protected function evaluateSignal(array $signal): bool
    {
        // 🔧 Mock logic: randomly trigger RSI blocks only
        $type = $signal['type'] ?? '';
        $config = $signal['config'] ?? [];

        if ($type === 'indicator' && ($config['content'] ?? '') === 'RSI') {
            return rand(0, 1) === 1; // 50/50 trigger chance
        }

        // All other signals return false for now
        return false;
    }
}
