<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Housing extends Model
{
    protected $table = 'housing';

    protected $fillable = ['title', 'area', 'price', 'description', 'purpose', 'type', 'availability'];

    public function contacts(): HasMany
    {
        return $this->hasMany(HousingContact::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HousingImage::class);
    }
}
