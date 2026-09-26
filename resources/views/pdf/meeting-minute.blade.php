<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Notulen Rapat - {{ $meeting->title }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; line-height: 1.5; }
  .kop { text-align: center; border-bottom: 3px double #111; padding-bottom: 10px; margin-bottom: 16px; }
  .kop h1 { font-size: 18px; margin: 0; text-transform: uppercase; }
  .kop p { margin: 2px 0; font-size: 11px; }
  .title { text-align: center; margin: 16px 0; }
  .title h2 { font-size: 15px; margin: 0; text-decoration: underline; }
  .title p { margin: 4px 0 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  table.info td { padding: 3px 6px; vertical-align: top; }
  table.bordered th, table.bordered td { border: 1px solid #333; padding: 5px 7px; text-align: left; }
  table.bordered th { background: #eee; }
  h3 { font-size: 13px; margin: 14px 0 6px; background: #f0f0f0; padding: 4px 8px; }
  .signature { margin-top: 28px; width: 100%; }
  .signature td { width: 50%; text-align: center; vertical-align: top; }
  .spacer { height: 70px; }
  .footer { margin-top: 20px; font-size: 10px; color: #555; text-align: center; }
  .whitespace { white-space: pre-line; }
</style>
</head>
<body>
  <div class="kop">
    <h1>Pemerintah / Kantor Pusat</h1>
    <p>Jl. Merdeka No. 1, Jakarta &bull; Telp. (021) 1234567 &bull; Email: info@kantor.id</p>
    <p>Website: www.kantor.id</p>
  </div>

  <div class="title">
    <h2>NOTULEN RAPAT</h2>
    <p>Nomor: {{ str_pad((string) $meeting->id, 4, '0', STR_PAD_LEFT) }}/NOTULEN/{{ $meeting->date instanceof \DateTimeInterface ? $meeting->date->format('m/Y') : \Carbon\Carbon::parse($meeting->date)->format('m/Y') }}</p>
  </div>

  <h3>I. Informasi Rapat</h3>
  <table class="info">
    <tr><td width="28%">Judul Rapat</td><td width="2%">:</td><td>{{ $meeting->title }}</td></tr>
    <tr><td>Hari / Tanggal</td><td>:</td><td>
      @php $d = $meeting->date instanceof \DateTimeInterface ? \Carbon\Carbon::parse($meeting->date) : \Carbon\Carbon::parse($meeting->date); @endphp
      {{ $d->locale('id')->isoFormat('dddd, D MMMM YYYY') }}
    </td></tr>
    <tr><td>Waktu</td><td>:</td><td>{{ substr((string) $meeting->start_time, 0, 5) }} &ndash; {{ substr((string) $meeting->end_time, 0, 5) }} WIB</td></tr>
    <tr><td>Tempat / Link</td><td>:</td><td>{{ $meeting->location_or_link }} ({{ ucfirst($meeting->type) }})</td></tr>
    <tr><td>Pemimpin Rapat</td><td>:</td><td>
      {{ optional($meeting->attendees->firstWhere('role_in_meeting', 'leader')?->user)->name ?? optional($meeting->creator)->name ?? '-' }}
    </td></tr>
    <tr><td>Notulis</td><td>:</td><td>{{ optional($minute->recorder)->name ?? '-' }}{{ optional($minute->recorder)->position ? ' ('.$minute->recorder->position.')' : '' }}</td></tr>
  </table>

  <h3>II. Agenda Pembahasan</h3>
  @if($meeting->agendas->count())
  <table class="bordered">
    <thead><tr><th width="6%">No</th><th>Agenda</th><th width="22%">Durasi</th></tr></thead>
    <tbody>
      @foreach($meeting->agendas as $i => $agenda)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td><strong>{{ $agenda->title }}</strong>@if($agenda->description)<br>{{ $agenda->description }}@endif</td>
        <td>{{ $agenda->duration_minutes ? $agenda->duration_minutes.' menit' : '-' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @else
  <p>-</p>
  @endif

  <h3>III. Daftar Kehadiran Peserta</h3>
  <table class="bordered">
    <thead><tr><th width="6%">No</th><th>Nama</th><th width="24%">Jabatan</th><th width="18%">Kehadiran</th></tr></thead>
    <tbody>
      @forelse($meeting->attendees as $i => $att)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ optional($att->user)->name ?? '-' }}</td>
        <td>{{ optional($att->user)->position ?? optional($att->user)->department ?? ucfirst($att->role_in_meeting) }}</td>
        <td>
          @switch($att->presence_status)
            @case('present') Hadir @break
            @case('excused') Izin @break
            @case('absent') Absen @break
            @default Menunggu @break
          @endswitch
        </td>
      </tr>
      @empty
      <tr><td colspan="4" style="text-align:center">Belum ada data kehadiran</td></tr>
      @endforelse
    </tbody>
  </table>

  <h3>IV. Rangkuman Pembahasan</h3>
  <p class="whitespace">{{ $minute->content_summary ?? '-' }}</p>

  <h3>V. Keputusan Resmi</h3>
  <p class="whitespace">{{ $minute->decisions ?? '-' }}</p>

  <h3>VI. Rencana Tindak Lanjut (PIC &amp; Deadline)</h3>
  @if($meeting->actionItems->count())
  <table class="bordered">
    <thead><tr><th width="6%">No</th><th>Tindak Lanjut</th><th width="20%">PIC</th><th width="18%">Deadline</th><th width="14%">Status</th></tr></thead>
    <tbody>
      @foreach($meeting->actionItems as $i => $item)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td><strong>{{ $item->title }}</strong>@if($item->description)<br>{{ $item->description }}@endif</td>
        <td>{{ optional($item->pic)->name ?? '-' }}</td>
        <td>{{ $item->due_date instanceof \DateTimeInterface ? $item->due_date->format('d/m/Y') : $item->due_date }}</td>
        <td>{{ ucfirst(str_replace('_', ' ', $item->status)) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @else
  <p>Tidak ada tindak lanjut khusus.</p>
  @endif

  @if($minute->review_notes)
  <h3>VII. Catatan Pimpinan</h3>
  <p class="whitespace">{{ $minute->review_notes }}</p>
  @endif

  <table class="signature">
    <tr>
      <td>
        Mengetahui,<br>Pimpinan Rapat<br><br><br><br>
        <strong><u>{{ optional($minute->reviewer)->name ?? optional($meeting->attendees->firstWhere('role_in_meeting', 'leader')?->user)->name ?? '....................' }}</u></strong><br>
        @if(optional($minute->reviewer)->position) {{ $minute->reviewer->position }} @endif
      </td>
      <td>
        Jakarta, {{ $d->locale('id')->isoFormat('D MMMM YYYY') }}<br>Notulis<br><br><br><br>
        <strong><u>{{ optional($minute->recorder)->name ?? '....................' }}</u></strong><br>
        @if(optional($minute->recorder)->position) {{ $minute->recorder->position }} @endif
      </td>
    </tr>
  </table>

  <div class="footer">
    Dokumen notulen resmi &bull; Status: {{ strtoupper(str_replace('_', ' ', $minute->status)) }}
    @if($minute->reviewed_at) &bull; Disahkan: {{ $minute->reviewed_at->format('d/m/Y H:i') }} @endif
  </div>
</body>
</html>
