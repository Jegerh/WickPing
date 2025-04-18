<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

class Kernel extends ConsoleKernel
{
    
    protected $commands = [
        \App\Console\Commands\EvaluateAlerts::class,
    ];
    
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $hour = config('app.hour');
        $min = config('app.min');
        $scheduledInterval = $hour !== '' ? (($min !== '' && $min != 0) ?  $min . ' */' . $hour . ' * * *' : '0 */' . $hour . ' * * *') : '*/' . $min . ' * * * *';
        if (env('IS_DEMO')) {
            $schedule->command('migrate:fresh --seed')->cron($scheduledInterval);
        }
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
