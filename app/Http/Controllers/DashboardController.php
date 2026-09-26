<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $totalMeetingsMonth = Meeting::whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])->count();

        $upcomingMeetingsCount = Meeting::where('date', '>=', $now->toDateString())
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->count();

        $pendingActionItemsCount = ActionItem::whereIn('status', ['pending', 'in_progress'])->count();

        $recentDocumentsCount = Document::where('created_at', '>=', $now->copy()->subDays(30))->count();

        $upcomingMeetings = Meeting::with(['creator', 'agendas', 'attendees.user'])
            ->where('date', '>=', $now->toDateString())
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        $myActionItems = ActionItem::with('meeting')
            ->where('pic_id', $userId)
            ->where('status', '!=', 'completed')
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'totalMeetingsMonth' => $totalMeetingsMonth,
            'upcomingMeetingsCount' => $upcomingMeetingsCount,
            'pendingActionItemsCount' => $pendingActionItemsCount,
            'recentDocumentsCount' => $recentDocumentsCount,
            'upcomingMeetings' => $upcomingMeetings,
            'myActionItems' => $myActionItems,
        ]);
    }
}
