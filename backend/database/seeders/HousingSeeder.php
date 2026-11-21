<?php

namespace Database\Seeders;

use App\Models\Housing;
use Illuminate\Database\Seeder;

class HousingSeeder extends Seeder
{
    public function run(): void
    {
        $listings = [
            [
                'title' => 'A home among the pines',
                'area' => 'Pine Hill, Kalaw',
                'price' => 'MMK 185,000,000',
                'description' => "Three-bedroom timber house on a quiet hillside, surrounded by pine trees.\nLarge veranda with mountain views, fireplace, and a small vegetable garden.",
                'purpose' => 'For sale', 'type' => 'House', 'availability' => 'Available',
                'contacts' => [
                    ['name' => 'Daw Khin Mar', 'phonenumber' => '+95 9 420 123 456', 'address' => 'Pine Hill Road, Kalaw'],
                    ['name' => 'U Zaw Min', 'phonenumber' => '+95 9 790 654 321', 'address' => 'Kalaw Market Street'],
                ],
            ],
            [
                'title' => 'Apartment near the market',
                'area' => 'Central Kalaw',
                'price' => 'MMK 750,000 / month',
                'description' => 'Bright two-bedroom apartment on the second floor, a five-minute walk from the central market. Furnished, with water heater and fast internet.',
                'purpose' => 'For rent', 'type' => 'Apartment', 'availability' => 'Reserved',
                'contacts' => [
                    ['name' => 'Ko Aung Htet', 'phonenumber' => '+95 9 251 888 777', 'address' => 'Station Road, Kalaw'],
                ],
            ],
            [
                'title' => 'Plot overlooking the valley',
                'area' => 'Outskirts of Kalaw',
                'price' => 'Contact for price',
                'description' => '4,800 sq ft residential plot with a clear title, road access, and uninterrupted valley views. Electricity available at the boundary.',
                'purpose' => 'For sale', 'type' => 'Land', 'availability' => 'Available',
                'contacts' => [
                    ['name' => 'U Than Htike', 'phonenumber' => '+95 9 444 222 111', 'address' => 'Aung Chan Thar Quarter, Kalaw'],
                    ['name' => 'Daw Su Su', 'phonenumber' => '+95 9 970 333 555', 'address' => null],
                ],
            ],
            [
                'title' => 'Cosy cottage with garden',
                'area' => 'Thiri Mingalar Ward',
                'price' => 'MMK 450,000 / month',
                'description' => 'Two-bedroom brick cottage with a fenced garden and parking. Quiet street, close to schools and the trekking office.',
                'purpose' => 'For rent', 'type' => 'House', 'availability' => 'Available',
                'contacts' => [
                    ['name' => 'Daw Hnin Wai', 'phonenumber' => '+95 9 262 100 200', 'address' => 'Thiri Mingalar Ward, Kalaw'],
                ],
            ],
            [
                'title' => 'Hillside condo, city view',
                'area' => 'Hilltop, Kalaw',
                'price' => 'MMK 95,000,000',
                'description' => 'One-bedroom condo on the top floor with a balcony and sweeping views of the town. Secure building with shared parking.',
                'purpose' => 'For sale', 'type' => 'Condo', 'availability' => 'Closed',
                'contacts' => [],
            ],
        ];

        foreach ($listings as $listing) {
            $contacts = $listing['contacts'];
            unset($listing['contacts']);

            $housing = Housing::updateOrCreate(['title' => $listing['title']], $listing);
            $housing->contacts()->delete();
            $housing->contacts()->createMany($contacts);
        }
    }
}