<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('initiatives', function (Blueprint $table) {
            $table->unsignedSmallInteger('reviews_count')->default(0)->after('min_age');
            $table->decimal('reviews_average', 2, 1)->nullable()->after('reviews_count');
        });
    }

    public function down(): void
    {
        Schema::table('initiatives', function (Blueprint $table) {
            $table->dropColumn(['reviews_count', 'reviews_average']);
        });
    }
};
