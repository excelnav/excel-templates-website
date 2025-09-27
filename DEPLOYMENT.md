# 部署指南

## 问题描述
Cloudflare Pages 压缩包上传限制为 25MB，当前网站大小为 32.6MB，需要解决部署大小限制问题。

## 解决方案

### 方案一：Git 集成自动部署 (推荐) ⭐

**优势：**
- ✅ 无文件大小限制
- ✅ 自动化部署
- ✅ 版本控制
- ✅ 完全免费

**实施步骤：**

1. **初始化 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   ```bash
   git remote add origin https://github.com/your-username/excel-templates-website.git
   git push -u origin main
   ```

3. **在 Cloudflare Pages 中设置**
   - 登录 Cloudflare Dashboard
   - 进入 Pages 页面
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择您的 GitHub 仓库
   - 设置构建配置：
     - Framework preset: `Hugo`
     - Build command: `hugo --minify`
     - Build output directory: `public`

4. **设置环境变量（如需要）**
   - `HUGO_VERSION`: `0.150.0`

### 方案二：资源优化 + 手动部署

**使用优化脚本：**
```powershell
# 运行优化脚本
.\scripts\optimize-for-deployment.ps1

# 或者分离下载文件
.\scripts\optimize-for-deployment.ps1 -SeparateDownloads
```

**优化效果：**
- 移除 downloads 目录可减少 8.81MB
- 图片压缩可减少 1-2MB
- 代码压缩可减少 0.5MB

### 方案三：混合 CDN 方案

1. **主站部署到 Cloudflare Pages**（不包含大文件）
2. **大文件上传到 Cloudflare R2 或其他 CDN**
3. **修改模板引用外部 CDN 链接**

## 推荐实施顺序

1. **立即实施：** 使用方案一（Git 集成）
2. **长期优化：** 结合方案三（CDN 分离）

## 注意事项

- 确保 `.gitignore` 文件正确配置
- 定期清理不必要的资源文件
- 监控网站大小增长趋势
- 考虑实施图片懒加载和压缩

## 自动化部署配置

项目已包含 GitHub Actions 配置文件 (`.github/workflows/deploy.yml`)，推送代码后将自动部署。

需要在 GitHub 仓库设置中添加以下 Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`