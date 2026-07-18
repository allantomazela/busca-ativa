drop index public.leads_session_idx;

create index leads_session_owner_idx
  on public.leads (search_session_id, user_id);
