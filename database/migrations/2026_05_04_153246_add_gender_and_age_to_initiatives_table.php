<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('initiatives', function (Blueprint $table) {
            $table->string('target_gender', 10)->nullable()->after('city');
            $table->unsignedTinyInteger('min_age')->nullable()->after('target_gender');
        });
    }

    public function down(): void
    {
        Schema::table('initiatives', function (Blueprint $table) {
            $table->dropColumn(['target_gender', 'min_age']);
        });
    }
};
