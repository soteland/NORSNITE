-- Allow friends to read each other's earned achievements (needed for friend profile page).
-- The existing "achievements_own" policy already covers own-user access (for all).
-- This separate select policy OR's with it for the friend case.

create policy "achievements_friends_select" on public.earned_achievements for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.friends
      where status = 'accepted'
        and (
          (requester_id = auth.uid() and receiver_id = earned_achievements.user_id)
          or (receiver_id = auth.uid() and requester_id = earned_achievements.user_id)
        )
    )
  );
