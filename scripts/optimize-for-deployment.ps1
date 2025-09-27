# Excel模板网站资源优化脚本
# 用于减少部署包大小，解决Cloudflare 25MB限制

param(
    [string]$PublicDir = "public",
    [string]$OutputDir = "public-optimized",
    [switch]$SeparateDownloads = $false
)

Write-Host "开始优化网站资源..." -ForegroundColor Green

# 创建优化后的目录
if (Test-Path $OutputDir) {
    Remove-Item $OutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# 复制除downloads外的所有文件
Write-Host "复制网站核心文件..." -ForegroundColor Yellow
Get-ChildItem $PublicDir -Recurse | Where-Object { 
    $_.FullName -notlike "*\downloads\*" 
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Resolve-Path $PublicDir).Path.Length + 1)
    $targetPath = Join-Path $OutputDir $relativePath
    
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    } else {
        $targetDir = Split-Path $targetPath -Parent
        if (!(Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $_.FullName $targetPath
    }
}

# 压缩图片 (如果有ImageMagick或其他工具)
Write-Host "优化图片资源..." -ForegroundColor Yellow
$imageDir = Join-Path $OutputDir "images"
if (Test-Path $imageDir) {
    # 这里可以添加图片压缩逻辑
    Write-Host "图片目录大小: $((Get-ChildItem $imageDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB) MB"
}

# 如果选择分离downloads
if ($SeparateDownloads) {
    Write-Host "创建downloads分离包..." -ForegroundColor Yellow
    $downloadsDir = Join-Path $PublicDir "downloads"
    if (Test-Path $downloadsDir) {
        Compress-Archive -Path $downloadsDir -DestinationPath "downloads-package.zip" -Force
        Write-Host "Downloads包已创建: downloads-package.zip"
    }
}

# 计算优化后的大小
$optimizedSize = (Get-ChildItem $OutputDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "优化后大小: $([math]::Round($optimizedSize, 2)) MB" -ForegroundColor Green

if ($optimizedSize -lt 25) {
    Write-Host "✅ 优化成功！大小在Cloudflare限制内" -ForegroundColor Green
} else {
    Write-Host "⚠️  仍超过25MB限制，建议使用Git部署方式" -ForegroundColor Yellow
}

# 创建部署包
Write-Host "创建部署包..." -ForegroundColor Yellow
Compress-Archive -Path "$OutputDir\*" -DestinationPath "deployment-package.zip" -Force
Write-Host "部署包已创建: deployment-package.zip"