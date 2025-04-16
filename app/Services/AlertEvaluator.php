<?php

namespace App\Services;

use App\Models\Wickping\Alert;
use Illuminate\Support\Facades\Log;

class AlertEvaluator
{
    public function run(): void
    {
        $alerts = Alert::where('status', 'active')->get();

        if ($alerts->isEmpty()) {
            Log::info('No active alerts to evaluate.');
            return;
        }

        foreach ($alerts as $alert) {
            Log::info("Evaluating alert #{$alert->id}: {$alert->name}");

            if ($this->evaluateWorkflow($alert->workflow)) {
                Log::info("🔥 Alert #{$alert->id} would TRIGGER!");
                // Later: dispatch(new SendAlert($alert));
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

        foreach ($group['blocks'] ?? [] as $block) {
            $results[] = $this->evaluateSignal($block);
        }

        foreach ($group['groups'] ?? [] as $nested) {
            $results[] = $this->evaluateGroup($nested);
        }

        return $type === 'AND' ? !in_array(false, $results, true) : in_array(true, $results, true);
    }

    protected function evaluateSignal(array $signal): bool
    {
        $type = $signal['type'] ?? '';
        $config = $signal['config'] ?? [];

        if ($type === 'indicator' && ($config['content'] ?? '') === 'RSI') {
            return rand(0, 1) === 1; // 🔧 Mock trigger
        }

        return false;
    }
}
