{{MARKER}}
# Called by Gemini CLI hooks to notify Superset of agent lifecycle events
# Events: BeforeAgent -> Start, AfterAgent -> Stop, AfterTool -> Start
# Gemini hooks receive JSON via stdin and MUST output valid JSON to stdout

$inputStr = ""
try { $inputStr = [Console]::In.ReadToEnd() } catch {}

$hookEventName = ""
if ($inputStr -match '"hook_event_name"\s*:\s*"([^"]*)"') {
  $hookEventName = $Matches[1]
}

$eventType = ""
switch ($hookEventName) {
  "BeforeAgent" { $eventType = "Start" }
  "AfterAgent"  { $eventType = "Stop" }
  "AfterTool"   { $eventType = "Start" }
  default {
    Write-Output '{}'
    exit 0
  }
}

# Output required JSON response immediately to avoid blocking the agent
Write-Output '{}'

if (-not $env:SUPERSET_TAB_ID) { exit 0 }

$port = if ($env:SUPERSET_PORT) { $env:SUPERSET_PORT } else { "{{DEFAULT_PORT}}" }
$uri = "http://127.0.0.1:$port/hook/complete"
$body = @{
  paneId       = $env:SUPERSET_PANE_ID
  tabId        = $env:SUPERSET_TAB_ID
  workspaceId  = $env:SUPERSET_WORKSPACE_ID
  eventType    = $eventType
  env          = $env:SUPERSET_ENV
  version      = $env:SUPERSET_HOOK_VERSION
}

try {
  Invoke-RestMethod -Uri $uri -Method Get -Body $body -TimeoutSec 2 -ErrorAction SilentlyContinue | Out-Null
} catch {}

exit 0
