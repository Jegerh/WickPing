<?php

use App\Http\Controllers\Api\V2\Auth\LoginController;
use App\Http\Controllers\Api\V2\Auth\LogoutController;
use App\Http\Controllers\Api\V2\Auth\RegisterController;
use App\Http\Controllers\Api\V2\MeController;
use Illuminate\Support\Facades\Route;
use LaravelJsonApi\Laravel\Facades\JsonApiRoute;
use LaravelJsonApi\Laravel\Http\Controllers\JsonApiController;
use LaravelJsonApi\Laravel\Routing\ResourceRegistrar;
use App\Http\Controllers\Api\V2\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\V2\Auth\ResetPasswordController;
use App\Http\Controllers\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v2')->middleware('json.api')->group(function () {
    Route::post('/login', LoginController::class)->name('login');
    Route::post('/register', RegisterController::class);
    Route::post('/logout', LogoutController::class)->middleware('auth:api');
    Route::post('/password-forgot', ForgotPasswordController::class);
    Route::post('/password-reset', ResetPasswordController::class)->name('password.reset');
});

Route::middleware('auth:api')->prefix('v2')->group(function () {
    Route::post('/alerts', [\App\Http\Controllers\Api\V2\AlertController::class, 'store']);
    Route::get('/alerts', [\App\Http\Controllers\Api\V2\AlertController::class, 'index']);
    Route::patch('/alerts/{id}', [\App\Http\Controllers\Api\V2\AlertController::class, 'update']);
    Route::delete('/alerts/{id}', [\App\Http\Controllers\Api\V2\AlertController::class, 'destroy']);
    Route::post('/alerts/{id}/restore', [\App\Http\Controllers\Api\V2\AlertController::class, 'restore']);
    Route::delete('/alerts/{id}/force', [\App\Http\Controllers\Api\V2\AlertController::class, 'forceDelete']);
    Route::get('/alerts/{id}', [\App\Http\Controllers\Api\V2\AlertController::class, 'show']);
    Route::delete('/alerts/trash/empty', [\App\Http\Controllers\Api\V2\AlertController::class, 'emptyTrash']);

});



JsonApiRoute::server('v2')->prefix('v2')->resources(function (ResourceRegistrar $server) {
    $server->resource('categories', JsonApiController::class);
    $server->resource('items', JsonApiController::class);
    $server->resource('permissions', JsonApiController::class)->only('index');
    $server->resource('roles', JsonApiController::class);
    $server->resource('tags', JsonApiController::class);
    $server->resource('users', JsonApiController::class);
    Route::get('me', [MeController::class, 'readProfile']);
    Route::patch('me', [MeController::class, 'updateProfile']);
    Route::post('/uploads/{resource}/{id}/{field}', UploadController::class);
});
