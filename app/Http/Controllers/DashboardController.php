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
        $user = $request->user();
        $userId = $user->id;
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $isManager = $user->isAdmin() || $user->isSekretaris() || $user->isPimpinan();

        $meetingsInScope = $isManager
            ? Meeting::query()
            : Meeting::whereHas('attendees', fn ($q) => $q->where('user_id', $userId));

        $totalMeetingsMonth = (clone $meetingsInScope)
            ->whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])->count();

        $upcomingMeetingsCount = (clone $meetingsInScope)
            ->where('date', '>=', $now->toDateString())
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->count();

        $actionItemsInScope = $isManager
            ? ActionItem::query()
            : ActionItem::where('pic_id', $userId);

        $pendingActionItemsCount = (clone $actionItemsInScope)->whereIn('status', ['pending', 'in_progress'])->count();

        $recentDocumentsCount = $isManager
            ? Document::where('created_at', '>=', $now->copy()->subDays(30))->count()
            : Document::where('created_at', '>=', $now->copy()->subDays(30))
                ->where(function ($q) use ($userId) {
                    $q->whereNull('meeting_id')
                        ->orWhere('uploader_id', $userId)
                        ->orWhereHas('meeting.attendees', fn ($a) => $a->where('user_id', $userId));
                })->count();

        $upcomingMeetings = (clone $meetingsInScope)
            ->with(['creator', 'agendas', 'attendees.user'])
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
