<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Housing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HousingController extends Controller
{
    private const FIELDS = ['title', 'area', 'price', 'description', 'purpose', 'type', 'availability'];

    // ---- Public (read-only, used by the client site) ----

    public function index(): JsonResponse
    {
        $items = Housing::with(['contacts', 'images'])->latest('id')->get();

        return response()->json($items->map(fn (Housing $h) => $this->present($h)));
    }

    public function show(Housing $housing): JsonResponse
    {
        return response()->json($this->present($housing->load(['contacts', 'images'])));
    }

    // ---- Super-admin writes ----

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $housing = DB::transaction(function () use ($request, $data) {
            $housing = Housing::create(array_intersect_key($data, array_flip(self::FIELDS)));
            $this->syncContacts($housing, $data['contacts'] ?? []);
            $this->storeImages($housing, $request);

            return $housing;
        });

        return response()->json($this->present($housing->load(['contacts', 'images'])), 201);
    }

    public function update(Request $request, Housing $housing): JsonResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($request, $data, $housing) {
            $housing->update(array_intersect_key($data, array_flip(self::FIELDS)));
            $this->syncContacts($housing, $data['contacts'] ?? []);

            $removals = $housing->images()->whereIn('id', $data['remove_image_ids'] ?? [])->get();
            foreach ($removals as $image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            }
            $this->storeImages($housing, $request);
        });

        return response()->json($this->present($housing->fresh(['contacts', 'images'])));
    }

    public function destroy(Housing $housing): Response
    {
        foreach ($housing->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $housing->delete(); // contacts and image rows cascade

        return response()->noContent();
    }

    // ---- Helpers ----

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:255'],
            'price' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'purpose' => ['nullable', 'in:For sale,For rent'],
            'type' => ['nullable', 'in:House,Apartment,Condo,Land,Other'],
            'availability' => ['nullable', 'in:Available,Reserved,Closed'],
            'contacts' => ['nullable', 'array', 'max:20'],
            'contacts.*.name' => ['required', 'string', 'max:255'],
            'contacts.*.phonenumber' => ['required', 'string', 'max:50'],
            'contacts.*.address' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer'],
        ]);
    }

    /** @param array<int, array<string, mixed>> $contacts */
    private function syncContacts(Housing $housing, array $contacts): void
    {
        $housing->contacts()->delete();
        foreach ($contacts as $contact) {
            $housing->contacts()->create([
                'name' => $contact['name'],
                'phonenumber' => $contact['phonenumber'],
                'address' => $contact['address'] ?? null,
            ]);
        }
    }

    private function storeImages(Housing $housing, Request $request): void
    {
        foreach ($request->file('images', []) as $file) {
            $housing->images()->create(['path' => $file->store('housing', 'public')]);
        }
    }

    /** @return array<string, mixed> */
    private function present(Housing $housing): array
    {
        return [
            'id' => $housing->id,
            'title' => $housing->title,
            'area' => $housing->area,
            'price' => $housing->price,
            'description' => $housing->description,
            'purpose' => $housing->purpose,
            'type' => $housing->type,
            'availability' => $housing->availability,
            'contacts' => $housing->contacts->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phonenumber' => $c->phonenumber,
                'address' => $c->address,
            ])->values(),
            'images' => $housing->images->map(fn ($i) => [
                'id' => $i->id,
                'url' => '/storage/'.$i->path,
            ])->values(),
        ];
    }
}
