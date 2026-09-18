Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$s = $sstEntry.Open()
$r = New-Object System.IO.StreamReader($s)
[xml]$xml = $r.ReadToEnd()
$r.Dispose(); $s.Dispose(); $zip.Dispose()

$i = 0
foreach ($si in $xml.sst.si) {
    $text = ""
    if ($si.t) { $text = $si.t.InnerText }
    elseif ($si.r) { $text = ($si.r | ForEach-Object { $_.t.InnerText }) -join "" }
    Write-Host "$i : $text"
    $i++
}
