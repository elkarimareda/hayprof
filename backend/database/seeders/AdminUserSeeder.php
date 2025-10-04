<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'contact@hayprof.com'],
            [
                'name' => 'Admin',
                'email' => 'contact@hayprof.com',
                'password' => Hash::make('hayprof'),
                'user_type' => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
