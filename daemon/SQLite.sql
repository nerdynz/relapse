-- SQLite
select *, case when is_purged then 1 else 0 end as xxx from capture;



select app_name, app_path from capture
group by app_name, app_path;



-- message CaptureDaySummary {
-- 	int64 CaptureDayTimeSeconds = 1;
-- 	int64 TotalCapturedTimeSeconds = 2;
-- 	int64 TotalCapturesForDay = 3;
-- 	int64 TotalCaptureSizeBytes = 4;
-- 	bool IsPurged = 5;
-- }


create view if not exists capture_day_summary
AS
select capture_day_time_seconds, count(capture_time_seconds) * 30 as total_captured_time_seconds, count(capture_time_seconds) as total_captures_for_day, sum(capture_size_bytes) as total_capture_size_bytes, is_purged 
from capture
group by capture_day_time_seconds, is_purged;



select * from capture_day_summary;