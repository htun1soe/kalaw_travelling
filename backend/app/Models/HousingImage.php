<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousingImage extends Model
{
    protected $table = 'housing_images';

    protected $fillable = ['housing_id', 'path'];

    public function housing(): BelongsTo
    {
        return $this->belongsTo(Housing::class);
    }
}
