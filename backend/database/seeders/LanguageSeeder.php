<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['name' => 'English', 'code' => 'en', 'native_name' => 'English'],
            ['name' => 'French', 'code' => 'fr', 'native_name' => 'Français'],
            ['name' => 'Spanish', 'code' => 'es', 'native_name' => 'Español'],
            ['name' => 'German', 'code' => 'de', 'native_name' => 'Deutsch'],
            ['name' => 'Italian', 'code' => 'it', 'native_name' => 'Italiano'],
            ['name' => 'Portuguese', 'code' => 'pt', 'native_name' => 'Português'],
            ['name' => 'Russian', 'code' => 'ru', 'native_name' => 'Русский'],
            ['name' => 'Chinese (Mandarin)', 'code' => 'zh', 'native_name' => '中文'],
            ['name' => 'Japanese', 'code' => 'ja', 'native_name' => '日本語'],
            ['name' => 'Korean', 'code' => 'ko', 'native_name' => '한국어'],
            ['name' => 'Arabic', 'code' => 'ar', 'native_name' => 'العربية'],
            ['name' => 'Hindi', 'code' => 'hi', 'native_name' => 'हिन्दी'],
            ['name' => 'Dutch', 'code' => 'nl', 'native_name' => 'Nederlands'],
            ['name' => 'Swedish', 'code' => 'sv', 'native_name' => 'Svenska'],
            ['name' => 'Norwegian', 'code' => 'no', 'native_name' => 'Norsk'],
            ['name' => 'Danish', 'code' => 'da', 'native_name' => 'Dansk'],
            ['name' => 'Polish', 'code' => 'pl', 'native_name' => 'Polski'],
            ['name' => 'Turkish', 'code' => 'tr', 'native_name' => 'Türkçe'],
            ['name' => 'Czech', 'code' => 'cs', 'native_name' => 'Čeština'],
            ['name' => 'Hungarian', 'code' => 'hu', 'native_name' => 'Magyar'],
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate(
                ['code' => $language['code']],
                $language
            );
        }
    }
}
