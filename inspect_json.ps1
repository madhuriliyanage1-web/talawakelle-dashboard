$json = [System.IO.File]::ReadAllText('talawakelle_data.json', [System.Text.Encoding]::UTF8) | ConvertFrom-Json

Write-Host "=== Planning Branch Rows count: $($json.planningBranch.Count) ==="
foreach ($r in $json.planningBranch | Select-Object -First 5) {
    Write-Host "Row $($r.rowNum):"
    $r.cells.PSObject.Properties | ForEach-Object { Write-Host "   $($_.Name): $($_.Value)" }
}

Write-Host "`n=== CEO Name Rows count: $($json.ceoName.Count) ==="
foreach ($r in $json.ceoName | Select-Object -First 10) {
    Write-Host "Row $($r.rowNum):"
    $r.cells.PSObject.Properties | ForEach-Object { Write-Host "   $($_.Name): $($_.Value)" }
}

Write-Host "`n=== Categories Rows count: $($json.categories.Count) ==="
foreach ($r in $json.categories | Select-Object -First 10) {
    Write-Host "Row $($r.rowNum):"
    $r.cells.PSObject.Properties | ForEach-Object { Write-Host "   $($_.Name): $($_.Value)" }
}

Write-Host "`n=== Workflow Rows count: $($json.workflow.Count) ==="
foreach ($r in $json.workflow | Select-Object -First 15) {
    Write-Host "Row $($r.rowNum):"
    $r.cells.PSObject.Properties | ForEach-Object { Write-Host "   $($_.Name): $($_.Value)" }
}
