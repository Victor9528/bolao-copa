-- New scoring rules:
-- 25 points for exact score
-- 18 points for correct winner + correct goals of winner
-- 15 points for correct winner + correct goal difference
-- 12 points for correct winner + correct goals of loser
-- 10 points for correct winner only
-- 0 points for incorrect

create or replace function public.calculate_prediction_points(
  predicted_home_score integer,
  predicted_away_score integer,
  actual_home_score integer,
  actual_away_score integer,
  counts_for_pool boolean
)
returns integer
language sql
immutable
as $$
  select case
    when not counts_for_pool then 0
    when actual_home_score is null or actual_away_score is null then 0
    when predicted_home_score = actual_home_score and predicted_away_score = actual_away_score then 25
    when sign(predicted_home_score - predicted_away_score) = sign(actual_home_score - actual_away_score)
      and actual_home_score != actual_away_score
      and (
        (actual_home_score > actual_away_score and predicted_home_score = actual_home_score)
        or
        (actual_away_score > actual_home_score and predicted_away_score = actual_away_score)
      )
      then 18
    when sign(predicted_home_score - predicted_away_score) = sign(actual_home_score - actual_away_score)
      and predicted_home_score - predicted_away_score = actual_home_score - actual_away_score
      and actual_home_score != actual_away_score
      then 15
    when sign(predicted_home_score - predicted_away_score) = sign(actual_home_score - actual_away_score)
      and actual_home_score != actual_away_score
      and (
        (actual_home_score > actual_away_score and predicted_away_score = actual_away_score)
        or
        (actual_away_score > actual_home_score and predicted_home_score = actual_home_score)
      )
      then 12
    when sign(predicted_home_score - predicted_away_score) = sign(actual_home_score - actual_away_score) then 10
    else 0
  end;
$$;
