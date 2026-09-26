Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "..\src\assets\zanzirangi-logo-new.jpeg"
$publicDir = Join-Path $PSScriptRoot "..\public"

$img = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-And-Save($image, $width, $height, $targetPath, $format) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($image, 0, 0, $width, $height)
    $graphics.Dispose()
    
    $bmp.Save($targetPath, $format)
    $bmp.Dispose()
    Write-Host "Generated: $targetPath ($($width)x$($height))"
}

# 1. 32x32 PNG
Resize-And-Save $img 32 32 (Join-Path $publicDir "favicon-32x32.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 2. 16x16 PNG
Resize-And-Save $img 16 16 (Join-Path $publicDir "favicon-16x16.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 3. 180x180 Apple Touch Icon
Resize-And-Save $img 180 180 (Join-Path $publicDir "apple-touch-icon.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 4. 192x192 PNG
Resize-And-Save $img 192 192 (Join-Path $publicDir "favicon.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 5. Create proper multi-resolution/32x32 ICO file
$icoBmp = New-Object System.Drawing.Bitmap 32, 32
$icoGraphics = [System.Drawing.Graphics]::FromImage($icoBmp)
$icoGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$icoGraphics.DrawImage($img, 0, 0, 32, 32)
$icoGraphics.Dispose()

$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream (Join-Path $publicDir "favicon.ico"), ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$icoBmp.Dispose()
Write-Host "Generated: favicon.ico"

# Copy original JPEG directly to public/zanzirangi-logo-new.jpeg as well
Copy-Item -Path $sourcePath -Destination (Join-Path $publicDir "zanzirangi-logo-new.jpeg") -Force
Write-Host "Copied zanzirangi-logo-new.jpeg to public"

$img.Dispose()
