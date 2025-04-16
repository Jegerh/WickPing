<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Wickping\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AlertController extends Controller
{
    public function store(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'workflow' => 'required|array',
            'delivery' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 401);
        }

        // Save alert
        $alert = Alert::create([
            'user_id' => $user->id,
            'name' => $request->input('name'),
            'workflow' => $request->input('workflow'),
            'delivery' => $request->input('delivery'),
            'status' => 'active',
        ]);

        return response()->json([
            'data' => $alert,
        ], 201);
    }

    public function index(Request $request)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $query = \App\Models\Wickping\Alert::where('user_id', $user->id);
    
        if ($request->query('trashed') === 'true') {
            $query = $query->onlyTrashed();
        }
    
        $alerts = $query->get();
    
        return response()->json(['data' => $alerts]);
    }

    public function show($id)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $alert = \App\Models\Wickping\Alert::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    
        if (!$alert) {
            return response()->json(['error' => 'Alert not found'], 404);
        }
    
        return response()->json(['data' => $alert]);
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $alert = \App\Models\Wickping\Alert::where('id', $id)->where('user_id', $user->id)->first();
    
        if (!$alert) {
            return response()->json(['error' => 'Alert not found'], 404);
        }
    
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'workflow' => 'sometimes|required|array',
            'delivery' => 'sometimes|required|array',
            'status' => 'sometimes|required|in:active,paused',
        ]);
    
        $alert->update($validated);
    
        return response()->json([
            'data' => $alert
        ]);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $alert = \App\Models\Wickping\Alert::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    
        if (!$alert) {
            return response()->json(['error' => 'Alert not found'], 404);
        }
    
        $alert->delete();
    
        return response()->json(['message' => 'Alert deleted']);
    }

    public function restore($id)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $alert = \App\Models\Wickping\Alert::onlyTrashed()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    
        if (!$alert) {
            return response()->json(['error' => 'Alert not found or not deleted'], 404);
        }
    
        $alert->restore();
    
        return response()->json(['message' => 'Alert restored']);
    }

    public function forceDelete($id)
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $alert = \App\Models\Wickping\Alert::onlyTrashed()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    
        if (!$alert) {
            return response()->json(['error' => 'Alert not found or not deleted'], 404);
        }
    
        $alert->forceDelete();
    
        return response()->json(['message' => 'Alert permanently deleted']);
    }

    public function emptyTrash()
    {
        $user = auth('api')->user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        $deleted = \App\Models\Wickping\Alert::onlyTrashed()
            ->where('user_id', $user->id)
            ->get();
    
        if ($deleted->isEmpty()) {
            return response()->json(['message' => 'No deleted alerts to purge.']);
        }
    
        foreach ($deleted as $alert) {
            $alert->forceDelete();
        }
    
        return response()->json(['message' => 'All trashed alerts permanently deleted.']);
    }
    
}
