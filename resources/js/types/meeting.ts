import type { User } from './auth';

export type Role = 'admin' | 'sekretaris' | 'pimpinan' | 'peserta';

export interface MeetingAgenda {
    id: number;
    meeting_id: number;
    title: string;
    description?: string | null;
    order: number;
    duration_minutes?: number | null;
}

export interface MeetingAttendee {
    id: number;
    meeting_id: number;
    user_id: number;
    role_in_meeting: 'leader' | 'notetaker' | 'participant';
    presence_status: 'pending' | 'present' | 'excused' | 'absent';
    presence_time?: string | null;
    notes?: string | null;
    user: User;
}

export interface MeetingMinute {
    id: number;
    meeting_id: number;
    recorded_by: number;
    content_summary?: string | null;
    decisions?: string | null;
    status: 'draft' | 'pending_review' | 'approved';
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    review_notes?: string | null;
    recorder?: User;
    reviewer?: User;
}

export interface ActionItem {
    id: number;
    meeting_id: number;
    minute_id?: number | null;
    pic_id: number;
    title: string;
    description?: string | null;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    completion_notes?: string | null;
    completed_at?: string | null;
    pic: User;
    meeting?: Meeting;
}

export interface DocumentItem {
    id: number;
    meeting_id?: number | null;
    uploader_id: number;
    title: string;
    file_name: string;
    file_size: number;
    file_type: string;
    category: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut';
    created_at: string;
    uploader: User;
    meeting?: Meeting;
}

export interface Meeting {
    id: number;
    title: string;
    description?: string | null;
    date: string;
    start_time: string;
    end_time: string;
    type: 'offline' | 'online' | 'hybrid';
    location_or_link: string;
    status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    created_by: number;
    creator?: User;
    agendas?: MeetingAgenda[];
    attendees?: MeetingAttendee[];
    minute?: MeetingMinute | null;
    action_items?: ActionItem[];
    documents?: DocumentItem[];
}

export interface InAppNotificationData {
    title: string;
    message: string;
    url?: string | null;
    meeting_id?: number | null;
    [key: string]: unknown;
}

export interface InAppNotification {
    id: string;
    type: string;
    data: InAppNotificationData;
    read_at: string | null;
    created_at: string;
}
