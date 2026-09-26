import { Clock, ListOrdered } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { MeetingAgenda } from '@/types';

interface AgendaTabProps {
    agendas?: MeetingAgenda[];
}

export default function AgendaTab({ agendas = [] }: AgendaTabProps) {
    const totalMinutes = agendas.reduce(
        (sum, item) => sum + (item.duration_minutes ?? 0),
        0
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold">Alur & Susunan Acara</h3>
                    <p className="text-xs text-muted-foreground">
                        Daftar urutan materi dan pokok bahasan yang didiskusikan dalam rapat.
                    </p>
                </div>
                {totalMinutes > 0 && (
                    <Badge variant="outline" className="gap-1.5 font-normal">
                        <Clock className="size-3.5 text-muted-foreground" />
                        Total Durasi: <span className="font-semibold">{totalMinutes} Menit</span>
                    </Badge>
                )}
            </div>

            {agendas.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <ListOrdered className="size-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Belum ada agenda terdaftar</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Agenda dapat ditambahkan saat mengedit informasi rapat.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {agendas.map((item, idx) => (
                        <div key={item.id ?? idx} className="relative flex flex-col gap-1.5 group">
                            {/* Dot indicator */}
                            <div className="absolute -left-6 top-1 flex size-5 items-center justify-center rounded-full border bg-background font-mono text-[10px] font-semibold text-primary shadow-xs">
                                {item.order ?? idx + 1}
                            </div>

                            <div className="rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-primary/40">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <h4 className="text-sm font-semibold tracking-tight">
                                        {item.title}
                                    </h4>
                                    {item.duration_minutes ? (
                                        <Badge variant="secondary" className="gap-1 text-xs font-normal">
                                            <Clock className="size-3 text-muted-foreground" />
                                            {item.duration_minutes} Menit
                                        </Badge>
                                    ) : null}
                                </div>

                                {item.description && (
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
