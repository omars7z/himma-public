<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminInitiativesController;
use App\Http\Controllers\Admin\AdminRewardsController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\CollaborationsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InitiativesController;
use App\Http\Controllers\MobileAppController;
use App\Http\Controllers\ParticipationsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RewardsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'show'])->name('home');

Route::get('collaborations', [CollaborationsController::class, 'collaborations'])->name('collaborations');
Route::get('mobile-app', [MobileAppController::class, 'show'])->name('mobile-app');
Route::get('collaborators', [CollaborationsController::class, 'collaborations'])->name('collaborators');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'show'])->name('dashboard');

    Route::get('profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::post('profile/cover', [ProfileController::class, 'updateCover'])->name('profile.cover');
    Route::put('profile/links', [ProfileController::class, 'updateLinks'])->name('profile.links');

    Route::post('rewards/{reward}/redeem', [RewardsController::class, 'redeem'])
        ->name('rewards.redeem');

    Route::get('initiatives', [InitiativesController::class, 'index'])->name('initiatives.index');
    Route::post('initiatives', [InitiativesController::class, 'store'])->name('initiatives.store');
    Route::get('initiatives/{initiative}', [InitiativesController::class, 'show'])->name('initiatives.show');
    Route::patch('initiatives/{initiative}', [InitiativesController::class, 'update'])->name('initiatives.update');
    Route::delete('initiatives/{initiative}', [InitiativesController::class, 'destroy'])->name('initiatives.destroy');

    Route::post('initiatives/{initiative}/participations', [ParticipationsController::class, 'store'])
        ->name('initiatives.participations.store');
    Route::delete('initiatives/{initiative}/participations', [ParticipationsController::class, 'destroy'])
        ->name('initiatives.participations.destroy');
    Route::post('initiatives/{initiative}/participations/{participation}/attend', [ParticipationsController::class, 'confirmAttendance'])
        ->name('initiatives.participations.attend');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('initiatives', [AdminInitiativesController::class, 'index'])->name('initiatives.index');
    Route::post('initiatives/{initiative}/approve', [AdminInitiativesController::class, 'approve'])->name('initiatives.approve');
    Route::post('initiatives/{initiative}/reject', [AdminInitiativesController::class, 'reject'])->name('initiatives.reject');

    Route::get('analytics', [AdminDashboardController::class, 'show'])->name('analytics');

    Route::get('users', [AdminUsersController::class, 'index'])->name('users.index');
    Route::delete('users/{user}', [AdminUsersController::class, 'destroy'])->name('users.destroy');
    Route::post('users/{user}/toggle-role', [AdminUsersController::class, 'toggleRole'])->name('users.toggle-role');
    Route::post('users/{user}/adjust-points', [AdminUsersController::class, 'adjustPoints'])->name('users.adjust-points');

    Route::get('rewards', [AdminRewardsController::class, 'index'])->name('rewards.index');
    Route::post('rewards', [AdminRewardsController::class, 'store'])->name('rewards.store');
    Route::put('rewards/{reward}', [AdminRewardsController::class, 'update'])->name('rewards.update');
    Route::delete('rewards/{reward}', [AdminRewardsController::class, 'destroy'])->name('rewards.destroy');
});

// Username catch-all — must be defined last to avoid shadowing other routes
Route::get('{username}', [ProfileController::class, 'showUser'])->name('users.show');
