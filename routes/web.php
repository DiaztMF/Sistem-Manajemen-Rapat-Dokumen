<?php

use App\Http\Controllers\MeetingAttendeeController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\MeetingMinuteController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

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
});

require __DIR__.'/settings.php';
