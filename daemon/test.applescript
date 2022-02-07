tell application "Finder"
  set AppleScript's text item delimiters to ","
	set brokenJSON to "["
	repeat with _app in (every process whose visible is true)
		brokenJSON = ""
		tell _app
			set brokenJSON to brokenJSON & "{ \"application\": {  \"frontmost\": \"" & (frontmost as boolean) & "\", \"name\": \"" & (name as string) & "\", \"windows\": ["
			repeat with x from 1 to (count windows)
				-- set windowProperties to properties of window x
				-- log windowProperties
				set windowPosition to position of window x
				set windowSize to size of window x
				-- set windowIndex to index of window x
				set windowName to name of window x
				set brokenJSON to brokenJSON & "{\"windowName\": \"" & (windowName as string) & "\", \"position: " & (windowPosition as string) & "\", \"windowSize: " & windowSize & "\"},"
				-- set position of window x to {0, 0}
				-- set size of window  to {100, 100}
			end repeat
			set brokenJSON to brokenJSON & "]}, "
		end tell
	end repeat
	set brokenJSON to brokenJSON & "]"
  set AppleScript's text item delimiters to ""
  return brokenJSON
end tell