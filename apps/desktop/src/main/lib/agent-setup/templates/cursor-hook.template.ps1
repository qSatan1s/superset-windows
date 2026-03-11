{{MARKER}}
# Called by cursor-agent hooks to notify Superset of agent lifecycle events
# Events: Start (beforeSubmitPrompt), Stop (stop),
#         PermissionRequest (beforeShellExecution, beforeMCPExecution)

# Drain stdin - Cursor pipes JSON context that we don't need, but we must consume it
# to prevent broken-pipe errors from blocking the agent
try { $null = [Console]::In.ReadToEnd() } catch {}

$eventType = $args[0]

$needsResponse = $false
switch ($eventType) {
  "Start" { }
  "Stop" { }
  "PermissionRequest" { $needsResponse = $true }
  default { exit 0 }
}

if ($needsResponse) {
  Write-Output '{"continue":true}'
}

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
