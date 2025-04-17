<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Wickping\Alert;
use Illuminate\Support\Facades\Log;
use App\Services\AlertEvaluator;

class EvaluateAlerts extends Command
{
    protected $signature = 'alerts:evaluate';
    protected $description = 'Evaluate active alerts and determine if they should trigger';

    public function handle()
    {
        $this->info("Evaluating alerts via AlertEvaluator...");
    
        $alerts = Alert::where('status', 'active')->get();
    
        if ($alerts->isEmpty()) {
            Log::info('No active alerts to evaluate.');
            return;
        }
    
        $evaluator = new AlertEvaluator();
    
        foreach ($alerts as $alert) {
            Log::info("Evaluating alert #{$alert->id}: {$alert->name}");
    
            if ($evaluator->evaluate($alert)) {
                Log::info("🔥 Alert #{$alert->id} would TRIGGER!");
            } else {
                Log::info("➖ Alert #{$alert->id} does not match.");
            }
        }
    }
}