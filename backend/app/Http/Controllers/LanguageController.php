<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LanguageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Language::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        } else {
            // Default to active languages only
            $query->active();
        }

        // Search by name, code, or native name
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('native_name', 'like', "%{$search}%");
            });
        }

        $languages = $query->orderBy('name')->get();

        return response()->json([
            'languages' => $languages
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:languages,name',
            'code' => 'required|string|max:5|unique:languages,code',
            'native_name' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $language = Language::create($validated);

        return response()->json([
            'message' => 'Language created successfully',
            'language' => $language
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Language $language)
    {
        return response()->json([
            'language' => $language
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Language $language)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('languages')->ignore($language->id)],
            'code' => ['sometimes', 'string', 'max:5', Rule::unique('languages')->ignore($language->id)],
            'native_name' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $language->update($validated);

        return response()->json([
            'message' => 'Language updated successfully',
            'language' => $language
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Language $language)
    {
        $language->delete();

        return response()->json([
            'message' => 'Language deleted successfully'
        ]);
    }
}
