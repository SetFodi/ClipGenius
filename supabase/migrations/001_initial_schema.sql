-- Videos uploaded by users
create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  filename text not null,
  storage_path text not null,
  duration_seconds integer,
  status text default 'uploaded', -- uploaded, transcribing, ready, error
  created_at timestamptz default now()
);

-- Transcription results
create table transcripts (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos on delete cascade,
  content jsonb not null, -- [{start, end, text}, ...]
  created_at timestamptz default now()
);

-- Generated clips
create table clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos on delete cascade,
  user_id uuid references auth.users not null,
  start_time float not null,
  end_time float not null,
  storage_path text,
  title text,
  status text default 'pending', -- pending, processing, ready, error
  created_at timestamptz default now()
);

-- Processing jobs for Railway worker
create table jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'transcribe', 'generate_clip'
  payload jsonb not null, -- e.g. { "video_id": "...", "clip_id": "..." }
  status text default 'pending', -- pending, processing, completed, failed
  result jsonb,
  error text,
  attempts int not null default 0,
  max_attempts int not null default 3,
  processing_progress jsonb, -- { "stage": "transcribing", "percent": 70 }
  timeout_at timestamptz, -- when this job should be considered timed out
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recommended indexes
create index on clips (video_id);
create index on clips (user_id);
create index on clips (status);
create index on jobs (status, created_at);
create index on videos (user_id);
create index on videos (status);

-- Row Level Security Policies

-- Enable RLS
alter table videos enable row level security;
alter table transcripts enable row level security;
alter table clips enable row level security;
alter table jobs enable row level security;

-- Videos: users can only access their own videos
create policy "Users can view own videos"
  on videos for select
  using (auth.uid() = user_id);

create policy "Users can insert own videos"
  on videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own videos"
  on videos for update
  using (auth.uid() = user_id);

create policy "Users can delete own videos"
  on videos for delete
  using (auth.uid() = user_id);

-- Transcripts: users can access transcripts of their videos
create policy "Users can view transcripts of own videos"
  on transcripts for select
  using (
    exists (
      select 1 from videos
      where videos.id = transcripts.video_id
      and videos.user_id = auth.uid()
    )
  );

-- Clips: users can only access their own clips
create policy "Users can view own clips"
  on clips for select
  using (auth.uid() = user_id);

create policy "Users can insert own clips"
  on clips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clips"
  on clips for update
  using (auth.uid() = user_id);

create policy "Users can delete own clips"
  on clips for delete
  using (auth.uid() = user_id);

-- Jobs: users can view jobs related to their videos
create policy "Users can view own jobs"
  on jobs for select
  using (
    exists (
      select 1 from videos
      where videos.id = (jobs.payload->>'video_id')::uuid
      and videos.user_id = auth.uid()
    )
  );

-- Storage buckets (run this in Supabase dashboard SQL editor)
-- Note: Storage policies are typically set via dashboard, but here's the SQL reference:
/*
-- Create buckets
insert into storage.buckets (id, name, public) values ('videos', 'videos', false);
insert into storage.buckets (id, name, public) values ('clips', 'clips', true);

-- Videos bucket policies
create policy "Users can upload videos"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own videos"
  on storage.objects for select
  using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own videos"
  on storage.objects for delete
  using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Clips bucket policies (public read)
create policy "Anyone can view clips"
  on storage.objects for select
  using (bucket_id = 'clips');

create policy "Users can upload clips"
  on storage.objects for insert
  with check (bucket_id = 'clips' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own clips"
  on storage.objects for delete
  using (bucket_id = 'clips' and auth.uid()::text = (storage.foldername(name))[1]);
*/

