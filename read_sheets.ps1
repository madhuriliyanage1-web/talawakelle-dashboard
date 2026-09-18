Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))

# 1. Read shared strings
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sst = @()
if ($sstEntry) {
    $s = $sstEntry.Open()
    $r = New-Object System.IO.StreamReader($s)
    $xml = [xml]$r.ReadToEnd()
    $r.Dispose(); $s.Dispose()
    foreach ($si in $xml.sst.si) {
        if ($si.t) { $sst += $si.t }
        elseif ($si.r) {
            $t = ($si.r | ForEach-Object { $_.t }) -join ""
            $sst += $t
        } else {
            $sst += ""
        }
    }
}

Write-Host "Total shared strings: $($sst.Count)"

# Helper function to read a sheet
function Read-Sheet($entryName, $sheetName) {
    Write-Host "=== SHEET: $sheetName ==="
    $entry = $zip.GetEntry($entryName)
    $s = $entry.Open()
    $r = New-Object System.IO.StreamReader($s)
    $xml = [xml]$r.ReadToEnd()
    $r.Dispose(); $s.Dispose()
    
    $rows = $xml.worksheet.sheetData.row
    foreach ($row in $rows | Select-Object -First 25) {
        $rowVals = @()
        foreach ($c in $row.c) {
            $val = ""
            if ($c.t -eq "s") {
                $idx = [int]$c.v
                $val = $sst[$idx]
            } elseif ($c.v) {
                $val = $c.v
            }
            $rowVals += "$($c.r): $val"
        }
        Write-Host ($rowVals -join " | ")
    }
}

Read-Sheet 'xl/worksheets/sheet2.xml' 'CEO Name'
Read-Sheet 'xl/worksheets/sheet3.xml' 'Project Catergory'
Read-Sheet 'xl/worksheets/sheet4.xml' 'work flow'

$zip.Dispose()
