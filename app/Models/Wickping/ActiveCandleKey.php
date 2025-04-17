<?php

namespace App\Models\Wickping;

use Illuminate\Database\Eloquent\Model;

class ActiveCandleKey extends Model
{
    protected $connection = 'wickping';
    protected $fillable = ['symbol', 'interval'];
}
