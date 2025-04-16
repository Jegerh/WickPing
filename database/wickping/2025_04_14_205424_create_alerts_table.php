<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::connection('wickping')->create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id'); // still points to users in 'laravel' DB
            $table->string('name');
            $table->jsonb('workflow');
            $table->jsonb('delivery');
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
