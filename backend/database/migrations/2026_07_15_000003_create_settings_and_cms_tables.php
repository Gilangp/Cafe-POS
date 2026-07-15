<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('site_name', 100)->default('NEMU Space Coffee Shop');
            $table->string('site_tagline', 200)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->string('operating_hours', 255)->nullable();
            $table->string('seo_title', 255)->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_keywords')->nullable();
            $table->string('logo', 255)->nullable();
            $table->string('favicon', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('social_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('platform', 50); // instagram, facebook, tiktok, etc.
            $table->string('url', 255);
            $table->string('icon', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('hero_banners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 150)->nullable();
            $table->text('subtitle')->nullable();
            $table->string('image', 255);
            $table->string('button_text', 50)->nullable();
            $table->string('button_link', 255)->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('about_us', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 150);
            $table->text('content');
            $table->string('image', 255)->nullable();
            $table->json('highlights')->nullable();
            $table->timestamps();
        });

        Schema::create('article_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('article_category_id')->constrained('article_categories')->onDelete('cascade');
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->text('content');
            $table->string('image', 255)->nullable();
            $table->enum('status', ['published', 'draft'])->default('draft');
            $table->timestamps();
        });

        Schema::create('galleries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('image', 255);
            $table->string('category', 100)->nullable();
            $table->text('caption')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('role', 100)->nullable();
            $table->text('content');
            $table->integer('rating')->default(5);
            $table->string('avatar', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('question', 255);
            $table->text('answer');
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('galleries');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('article_categories');
        Schema::dropIfExists('about_us');
        Schema::dropIfExists('hero_banners');
        Schema::dropIfExists('social_media');
        Schema::dropIfExists('settings');
    }
};
