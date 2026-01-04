# Hướng dẫn Deploy Frontend lên Vercel

## Các bước deploy

### 1. Chuẩn bị

Đảm bảo bạn đã:
- Push code lên GitHub/GitLab/Bitbucket
- Có tài khoản Vercel
- Backend đã được deploy và có URL

### 2. Deploy trên Vercel

#### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Truy cập [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import repository từ GitHub
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (nếu repo có cả backend và frontend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Thêm Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_SOCKET_URL=https://your-backend-url.com
   ```

6. Click "Deploy"

#### Cách 2: Qua Vercel CLI

```bash
cd frontend
npm i -g vercel
vercel
```

### 3. Cấu hình sau khi deploy

1. **Kiểm tra Environment Variables**:
   - Vào Project Settings → Environment Variables
   - Đảm bảo `VITE_API_URL` và `VITE_SOCKET_URL` đã được set

2. **Kiểm tra Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Redeploy** nếu cần:
   - Vào Deployments
   - Click "..." → Redeploy

### 4. Xử lý lỗi 404

Nếu gặp lỗi 404:
- ✅ File `vercel.json` đã được tạo tự động
- ✅ Đảm bảo `outputDirectory` là `dist`
- ✅ Kiểm tra build logs trong Vercel dashboard

### 5. Cấu hình Custom Domain (Tùy chọn)

1. Vào Project Settings → Domains
2. Thêm domain của bạn
3. Follow hướng dẫn để cấu hình DNS

## Troubleshooting

### Lỗi: 404 NOT_FOUND
- ✅ Kiểm tra `vercel.json` có trong repo
- ✅ Đảm bảo build thành công
- ✅ Kiểm tra Output Directory là `dist`

### Lỗi: Environment variables không hoạt động
- ✅ Đảm bảo variables bắt đầu với `VITE_`
- ✅ Redeploy sau khi thêm variables

### Lỗi: API calls fail
- ✅ Kiểm tra CORS trên backend
- ✅ Đảm bảo `FRONTEND_URL` trong backend match với Vercel URL
- ✅ Kiểm tra `VITE_API_URL` và `VITE_SOCKET_URL` đã được set

## Notes

- Vercel tự động detect Vite và cấu hình đúng
- File `vercel.json` sẽ handle SPA routing
- Build output sẽ ở folder `dist/`
- Environment variables cần prefix `VITE_` để Vite expose chúng

