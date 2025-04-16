<?php

namespace App\Models\Wickping;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alert extends Model
{
    use SoftDeletes;
    protected $connection = 'wickping'; // Use the Wickping DB
    protected $table = 'alerts';

    protected $fillable = [
        'user_id',
        'name',
        'workflow',
        'delivery',
        'status',
    ];

    protected $casts = [
        'workflow' => 'array',
        'delivery' => 'array',
    ];
}
