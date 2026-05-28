# Tài liệu: Logic Đăng Nhập & Role Admin

Tài liệu này hướng dẫn cách đăng nhập vào tài khoản Admin và giải thích cơ chế phân quyền phía Backend.

## 1. Tài khoản Admin mặc định (Seed Data)
Trong quá trình khởi tạo hệ thống, Backend đã tạo sẵn một tài khoản Admin để kiểm thử.

- **Email:** `admin123@gmail.com`
- **Password:** `Abc123@`
- **Role:** `Admin`

---

## 2. Quy trình Đăng nhập
**Endpoint:** `POST /api/Auth/login`

### Request:
```json
{
  "email": "admin123@gmail.com",
  "password": "Abc123@"
}
```

### Response (Thành công):
```json
{
  "isSuccess": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "...",
    "email": "admin123@gmail.com",
    "fullName": "Administrator",
    "accessTokenExpiration": "2026-05-27T...",
    "refreshTokenExpiration": "..."
  },
  "message": "Đăng nhập thành công.",
  "statusCode": 200
}
```

---

## 3. Cơ chế Phân quyền (Authorization)
Backend sử dụng **ASP.NET Core Identity** để quản lý người dùng và vai trò.

### Các Role hiện có:
1. `Admin`: Có toàn quyền hệ thống (quản lý người dùng, kế hoạch, template).
2. `User`: Người dùng thông thường (chỉ quản lý kế hoạch của bản thân).

### Kiểm tra Role ở FE:
Hiện tại, trong JWT Access Token trả về, các thông tin định danh (Claims) bao gồm:
- `sub`: UserId (Guid)
- `email`: Email người dùng
- `fullName`: Tên hiển thị

> **Lưu ý quan trọng:** Hiện tại `TokenService.cs` đang thiếu việc add Role vào JWT. Tuy nhiên, hệ thống vẫn nhận diện Role thông qua Database khi sử dụng thuộc tính `[Authorize(Roles = "Admin")]` ở các Controller dành cho Admin.
> 
> **Cách xử lý cho FE:** Để biết người dùng có phải Admin hay không, FE có thể:
> 1. Kiểm tra Email (Tạm thời đối với account seeded).
> 2. Đợi Backend cập nhật Role vào Payload của Token (Khuyến nghị).

---

## 4. Logic Xử lý Token
- **Access Token:** Hết hạn sau **60 phút** (mặc định). Dùng để gửi trong Header `Authorization: Bearer {token}`.
- **Refresh Token:** Dùng để lấy Access Token mới khi cái cũ hết hạn mà không cần người dùng nhập lại mật khẩu.
- **Endpoint Refresh:** `POST /api/Auth/refresh-token` gửi kèm `refreshToken` trong body.

---

## 5. Trích dẫn Code cấu hình Admin (DataSeeder.cs)
```csharp
// Logic tạo tài khoản admin mặc định
const string adminEmail = "admin123@gmail.com";
const string adminPassword = "Abc123@";

var adminUser = new ApplicationUser
{
    UserName = adminEmail,
    Email = adminEmail,
    FullName = "Administrator",
    EmailConfirmed = true
};

// Tạo user với mật khẩu
var result = await userManager.CreateAsync(adminUser, adminPassword);
if (result.Succeeded)
{
    // Gán quyền Admin
    await userManager.AddToRoleAsync(adminUser, "Admin");
}
```
