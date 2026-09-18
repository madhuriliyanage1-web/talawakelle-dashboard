Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))

# Shared strings with proper UTF-8
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$s = $sstEntry.Open()
$r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
$sstContent = $r.ReadToEnd()
$r.Dispose(); $s.Dispose()
[xml]$sstXml = $sstContent

$sst = @()
foreach ($si in $sstXml.sst.si) {
    $txt = ""
    if ($si.t) {
        $txt = $si.t.InnerText
    } elseif ($si.r) {
        $txt = ($si.r | ForEach-Object { $_.t.InnerText }) -join ""
    }
    $sst += $txt
}

function Parse-SheetRows($entryPath) {
    $entry = $zip.GetEntry($entryPath)
    if (!$entry) { return @() }
    $s = $entry.Open()
    $r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
    [xml]$xml = $r.ReadToEnd()
    $r.Dispose(); $s.Dispose()
    
    $rowsData = @()
    foreach ($row in $xml.worksheet.sheetData.row) {
        $rowObj = [ordered]@{}
        $rowObj["rowNum"] = $row.r
        $cells = @{}
        foreach ($c in $row.c) {
            $colRef = $c.r -replace '[0-9]', ''
            $val = ""
            if ($c.t -eq "s") {
                $idx = [int]$c.v
                $val = $sst[$idx]
            } elseif ($c.v) {
                $val = $c.v
            }
            $cells[$colRef] = $val
        }
        $rowObj["cells"] = $cells
        $rowsData += $rowObj
    }
    return $rowsData
}

$data = [ordered]@{
    "planningBranch" = Parse-SheetRows 'xl/worksheets/sheet1.xml'
    "ceoName"        = Parse-SheetRows 'xl/worksheets/sheet2.xml'
    "categories"     = Parse-SheetRows 'xl/worksheets/sheet3.xml'
    "workflow"       = Parse-SheetRows 'xl/worksheets/sheet4.xml'
}

$zip.Dispose()

$json = $data | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'talawakelle_data.json'), $json, [System.Text.Encoding]::UTF8)
Write-Host "Successfully wrote talawakelle_data.json!"
