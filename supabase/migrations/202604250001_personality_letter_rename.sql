-- Personality letter migration: Y→X (Clarity negative), G→D (Autonomy positive), O→H (Autonomy negative).
-- Idempotent: re-running is safe.

update public.questions
set letter = case letter
  when 'Y' then 'X'
  when 'G' then 'D'
  when 'O' then 'H'
  else letter
end
where letter in ('Y', 'G', 'O');

update public.session_results
set type_code = translate(type_code, 'YGO', 'XDH')
where type_code ~ '[YGO]';

insert into public.dimension_metadata (id, positive_letter, negative_letter, positive_label, negative_label, description)
values
  ('clarity', 'C', 'X', 'Clear', 'Cryptic', 'Measures how understandable the human is in requests.'),
  ('tone', 'K', 'B', 'Kind', 'Blunt', 'Measures interpersonal style and tone toward the agent.'),
  ('thinking_style', 'V', 'T', 'Visionary', 'Tactical', 'Measures whether requests start from vision or execution.'),
  ('autonomy', 'D', 'H', 'Delegating', 'Hands-On', 'Measures how much autonomy the human gives the agent.')
on conflict (id) do update set
  positive_letter = excluded.positive_letter,
  negative_letter = excluded.negative_letter,
  positive_label = excluded.positive_label,
  negative_label = excluded.negative_label,
  description = excluded.description;
