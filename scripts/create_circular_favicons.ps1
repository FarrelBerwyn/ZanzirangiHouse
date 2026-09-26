Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "..\src\assets\zanzirangi-logo-new.jpeg"
$publicDir = Join-Path $PSScriptRoot "..\public"

$img = [System.Drawing.Image]::FromFile($sourcePath)

function Create-Circular-Image($source, $size, $targetPath, $format) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Define circular path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $margin = 0.5
    $diameter = [float]($size - (2 * $margin))
    $path.AddEllipse($margin, $margin, $diameter, $diameter)
    
    # Clip drawing to circle
    $g.SetClip($path)
    $g.DrawImage($source, 0, 0, $size, $size)
    $g.ResetClip()
    
    # Draw subtle elegant gold border around the circle
    $penWidth = [float]([Math]::Max(1.0, $size / 32))
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(240, 196, 162, 122)), $penWidth
    $g.DrawEllipse($pen, $margin, $margin, $diameter, $diameter)
    
    $pen.Dispose()
    $path.Dispose()
    $g.Dispose()
    
    $bmp.Save($targetPath, $format)
    $bmp.Dispose()
    Write-Host "Created circular: $targetPath ($($size)x$($size))"
}

# 1. 16x16 Circular PNG
Create-Circular-Image $img 16 (Join-Path $publicDir "favicon-16x16.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 2. 32x32 Circular PNG
Create-Circular-Image $img 32 (Join-Path $publicDir "favicon-32x32.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 3. 48x48 Circular PNG
Create-Circular-Image $img 48 (Join-Path $publicDir "favicon-48x48.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 4. 180x180 Circular Apple Touch Icon
Create-Circular-Image $img 180 (Join-Path $publicDir "apple-touch-icon.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 5. 192x192 Circular PNG
Create-Circular-Image $img 192 (Join-Path $publicDir "favicon.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 6. 512x512 High-Res Circular Logo
Create-Circular-Image $img 512 (Join-Path $publicDir "zanzirangi-logo-circle.png") ([System.Drawing.Imaging.ImageFormat]::Png)

# 7. Multi-resolution circular ICO file (32x32 icon)
$icoBmp = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$icoG = [System.Drawing.Graphics]::FromImage($icoBmp)
$icoG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$icoG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$icoG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$icoG.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$icoG.Clear([System.Drawing.Color]::Transparent)

$icoPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$icoPath.AddEllipse(0.5, 0.5, 31.0, 31.0)
$icoG.SetClip($icoPath)
$icoG.DrawImage($img, 0, 0, 32, 32)
$icoG.ResetClip()

$icoPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(240, 196, 162, 122)), 1.0
$icoG.DrawEllipse($icoPen, 0.5, 0.5, 31.0, 31.0)
$icoPen.Dispose()
$icoPath.Dispose()
$icoG.Dispose()

$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream (Join-Path $publicDir "favicon.ico"), ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$icoBmp.Dispose()
Write-Host "Created circular: favicon.ico"

$img.Dispose()
