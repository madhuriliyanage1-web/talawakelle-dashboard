Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))

# Load SST
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$s = $sstEntry.Open()
$r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
[xml]$sstXml = $r.ReadToEnd()
$r.Dispose(); $s.Dispose()

$sst = @()
foreach ($si in $sstXml.sst.si) {
    $sst += $si.InnerText
}

function Parse-Sheet($entryPath) {
    $entry = $zip.GetEntry($entryPath)
    if (!$entry) { return @() }
    $s = $entry.Open()
    $r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
    [xml]$xml = $r.ReadToEnd()
    $r.Dispose(); $s.Dispose()

    $rows = @()
    foreach ($row in $xml.worksheet.sheetData.row) {
        $rowMap = [ordered]@{}
        $rowMap["_row"] = [int]$row.r
        foreach ($c in $row.c) {
            $col = $c.r -replace '[0-9]', ''
            $val = ""
            if ($c.t -eq "s") {
                $val = $sst[[int]$c.v]
            } elseif ($c.v) {
                $val = $c.v
            }
            $rowMap[$col] = $val
        }
        $rows += $rowMap
    }
    return $rows
}

$result = [ordered]@{
    "PlanningBranch" = Parse-Sheet 'xl/worksheets/sheet1.xml'
    "CEONames"       = Parse-Sheet 'xl/worksheets/sheet2.xml'
    "Categories"     = Parse-Sheet 'xl/worksheets/sheet3.xml'
    "Workflows"      = Parse-Sheet 'xl/worksheets/sheet4.xml'
}

$zip.Dispose()

$json = $result | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'talawakelle_extracted.json'), $json, [System.Text.Encoding]::UTF8)
Write-Host "Extracted all sheets to talawakelle_extracted.json!"
