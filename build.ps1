# Hugo网站构建脚本
# 用于本地构建和Cloudflare Pages部署

Write-Host "开始构建Hugo网站..." -ForegroundColor Green

# 检查Hugo是否安装
if (!(Get-Command "hugo" -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到Hugo命令。请先安装Hugo。" -ForegroundColor Red
    exit 1
}

# 清理之前的构建
if (Test-Path "public") {
    Write-Host "清理之前的构建文件..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "public"
}

# 构建网站
Write-Host "构建网站..." -ForegroundColor Blue
hugo --minify --gc

# 检查构建是否成功
if ($LASTEXITCODE -eq 0) {
    Write-Host "构建成功完成！" -ForegroundColor Green
    Write-Host "输出目录: public/" -ForegroundColor Cyan
    
    # 显示构建统计
    $files = Get-ChildItem -Recurse "public" | Measure-Object
    Write-Host "生成文件数量: $($files.Count)" -ForegroundColor Cyan
    
    # 检查关键文件
    $keyFiles = @("public/index.html", "public/sitemap.xml", "public/robots.txt")
    foreach ($file in $keyFiles) {
        if (Test-Path $file) {
            Write-Host "✓ $file" -ForegroundColor Green
        } else {
            Write-Host "✗ $file (缺失)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "`n部署说明:" -ForegroundColor Yellow
Write-Host "1. 将 public/ 目录内容上传到你的Web服务器" -ForegroundColor White
Write-Host "2. 或者连接到Cloudflare Pages进行自动部署" -ForegroundColor White
Write-Host "3. 确保更新 hugo.toml 中的 baseURL 设置" -ForegroundColor White