Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$s = $sstEntry.Open()
$r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
[xml]$xml = $r.ReadToEnd()
$r.Dispose(); $s.Dispose(); $zip.Dispose()

for ($i = 0; $i -lt [Math]::Min(30, $xml.sst.si.Count); $i++) {
    Write-Host "$i : $($xml.sst.si[$i].InnerText)"
}
