<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousingContact extends Model
{
    protected $table = 'housing_contact';

    protected $fillable = ['housing_id', 'name', 'phonenumber', 'address'];

    public function housing(): BelongsTo
    {
        return $this->belongsTo(Housing::class);
    }
}
