Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))

$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sst = @()
if ($sstEntry) {
    $s = $sstEntry.Open()
    $r = New-Object System.IO.StreamReader($s)
    [xml]$xml = $r.ReadToEnd()
    $r.Dispose(); $s.Dispose()
    foreach ($si in $xml.sst.si) {
        $text = ""
        if ($si.t) {
            $text = $si.t.InnerText
        } elseif ($si.r) {
            $text = ($si.r | ForEach-Object { $_.t.InnerText }) -join ""
        }
        $sst += $text
    }
}

# Sheet 1: Planning Branch Update
$entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$s = $entry.Open()
$r = New-Object System.IO.StreamReader($s)
[xml]$xml = $r.ReadToEnd()
$r.Dispose(); $s.Dispose()
$zip.Dispose()

Write-Host "Total rows in Sheet 1: $($xml.worksheet.sheetData.row.Count)"

# Let's inspect the headers (row 1 and 2)
foreach ($row in $xml.worksheet.sheetData.row | Select-Object -First 30) {
    $rowCells = @()
    foreach ($c in $row.c) {
        $val = ""
        if ($c.t -eq "s") {
            $val = $sst[[int]$c.v]
        } elseif ($c.v) {
            $val = $c.v
        }
        $rowCells += "$($c.r): $val"
    }
    Write-Host "Row $($row.r): " ($rowCells -join " | ")
}
