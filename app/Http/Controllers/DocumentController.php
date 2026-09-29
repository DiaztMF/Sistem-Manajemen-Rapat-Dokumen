<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Document::class);

        $user = $request->user();
        $query = Document::query()->with(['uploader:id,name', 'meeting:id,title']);

        if (! $user->isAdmin() && ! $user->isSekretaris() && ! $user->isPimpinan()) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('meeting_id')
                    ->orWhere('uploader_id', $user->id)
                    ->orWhereHas('meeting.attendees', fn ($a) => $a->where('user_id', $user->id));
            });
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }
        if ($meetingId = $request->integer('meeting_id')) {
            $query->where('meeting_id', $meetingId);
        }
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        $documents = $query->latest()->paginate(10)->withQueryString();

        $meetingsQuery = Meeting::select(['id', 'title'])->orderBy('title');
        if (! $user->isAdmin() && ! $user->isSekretaris() && ! $user->isPimpinan()) {
            $meetingsQuery->whereHas('attendees', fn ($q) => $q->where('user_id', $user->id));
        }

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'filters' => $request->only(['category', 'meeting_id', 'search']),
            'meetings' => $meetingsQuery->get(),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Document::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'meeting_id' => ['nullable', 'exists:meetings,id'],
            'category' => ['required', 'in:undangan,materi,notulen_pdf,bukti_tindak_lanjut'],
            'file' => ['required', 'file', 'max:15360', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png'],
        ]);

        $path = $request->file('file')->store('documents', 'local');

        Document::create([
            'meeting_id' => $validated['meeting_id'] ?? null,
            'uploader_id' => $request->user()->id,
            'title' => $validated['title'],
            'file_name' => $request->file('file')->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $request->file('file')->getSize(),
            'file_type' => $request->file('file')->getClientOriginalExtension(),
            'category' => $validated['category'],
        ]);

        return back();
    }

    public function download(Document $document)
    {
        Gate::authorize('download', $document);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function destroy(Document $document)
    {
        Gate::authorize('delete', $document);

        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }
        $document->delete();

        return back();
    }
}
