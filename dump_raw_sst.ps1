Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'temp_reg.xlsx'))
$sstEntry = $zip.GetEntry('xl/sharedStrings.xml')
$s = $sstEntry.Open()
$r = New-Object System.IO.StreamReader($s, [System.Text.Encoding]::UTF8)
$txt = $r.ReadToEnd()
$r.Dispose(); $s.Dispose(); $zip.Dispose()

# Print the first 1000 characters of raw XML
Write-Host $txt.Substring(0, 1500)
