<?php

use App\Http\Controllers\ActionItemController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\MeetingAttendeeController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\MeetingMinuteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::redirect('/register', '/login')->name('register.redirect');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('meetings', [MeetingController::class, 'index'])->name('meetings.index');
    Route::get('meetings/create', [MeetingController::class, 'create'])->name('meetings.create');
    Route::post('meetings', [MeetingController::class, 'store'])->name('meetings.store');
    Route::get('meetings/{meeting}', [MeetingController::class, 'show'])->name('meetings.show');
    Route::get('meetings/{meeting}/edit', [MeetingController::class, 'edit'])->name('meetings.edit');
    Route::put('meetings/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
    Route::patch('meetings/{meeting}/status', [MeetingController::class, 'updateStatus'])->name('meetings.update-status');
    Route::delete('meetings/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
    Route::patch('meetings/{meeting}/attendees/{attendee}', [MeetingAttendeeController::class, 'update'])->name('meetings.attendees.update');

    Route::get('minutes', [MeetingMinuteController::class, 'index'])->name('minutes.index');
    Route::post('meetings/{meeting}/minutes', [MeetingMinuteController::class, 'storeOrUpdate'])->name('meetings.minutes.store');
    Route::patch('minutes/{minute}/approve', [MeetingMinuteController::class, 'approve'])->name('minutes.approve');
    Route::get('minutes/{minute}/export-pdf', [MeetingMinuteController::class, 'exportPdf'])->name('minutes.export-pdf');

    Route::get('action-items', [ActionItemController::class, 'index'])->name('action-items.index');
    Route::post('meetings/{meeting}/action-items', [ActionItemController::class, 'store'])->name('meetings.action-items.store');
    Route::patch('action-items/{actionItem}', [ActionItemController::class, 'update'])->name('action-items.update');
    Route::delete('action-items/{actionItem}', [ActionItemController::class, 'destroy'])->name('action-items.destroy');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
});

require __DIR__.'/settings.php';
