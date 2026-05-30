# Tài liệu chi tiết Logic User Profile - Planify

Tài liệu này mô tả cách thức quản lý và truy xuất thông tin người dùng trong hệ thống Planify.

---

## 1. Cấu trúc Dữ liệu Người dùng

Hệ thống sử dụng **ASP.NET Core Identity** làm nền tảng để quản lý xác thực và thông tin người dùng.

### 1.1 Thực thể ApplicationUser
Kế thừa từ `IdentityUser<Guid>`, lưu trữ các thông tin cơ bản:
- **Id**: Mã định danh duy nhất (Guid).
- **Email**: Địa chỉ email (cũng là UserName).
- **FullName**: Họ và tên đầy đủ của người dùng.
- **PasswordHash**: Mật khẩu đã được mã hóa.
- **PhoneNumber**: Số điện thoại (tùy chọn).

### 1.2 UserProfileResponseDto
Dữ liệu trả về cho Frontend khi truy vấn profile:
- **Id**: Guid.
- **Email**: String.
- **FullName**: String.

---

## 2. Luồng Xử lý Truy xuất Profile

Tính năng này được quản lý bởi `UserController` và `UserService`.

### 2.1 Điểm cuối API
- **Endpoint**: `GET /api/user/profile`
- **Yêu cầu**: Header `Authorization: Bearer {token}`.

### 2.2 Quy trình thực hiện
1. **Xác thực**: Middleware kiểm tra tính hợp lệ của JWT Token.
2. **Trích xuất Identity**: Controller lấy `userId` từ các claims của token (thông qua `ClaimTypes.NameIdentifier` hoặc claim `"sub"`).
3. **Truy vấn Database**: `UserService` sử dụng `UserManager` để tìm kiếm thông tin người dùng trong database dựa trên `userId`.
4. **Trả về dữ liệu**: Nếu tìm thấy, dữ liệu được ánh xạ sang `UserProfileResponseDto` và trả về với mã lỗi 200. Nếu không, trả về mã lỗi 404.

---

## 3. Bảo mật & Phân quyền

- **Yêu cầu Đăng nhập**: Tất cả các API trong `UserController` đều được bảo vệ bởi attribute `[Authorize]`. Người dùng không thể xem profile của chính mình hoặc người khác nếu không cung cấp token hợp lệ.
- **Tính riêng tư**: Logic hiện tại chỉ cho phép người dùng lấy thông tin của chính mình dựa trên token họ đang nắm giữ. Không có API công khai để tra cứu profile của người dùng khác bằng ID.

---

## 4. Tích hợp với Google Login

Khi người dùng đăng nhập bằng Google:
1. Hệ thống tự động lấy thông tin `Name` từ Google và lưu vào trường `FullName` trong database.
2. Email từ Google được dùng làm định danh chính.
3. Trong lần truy cập profile sau đó, các thông tin này sẽ được trả về đồng nhất như người dùng đăng ký thủ công.

---

## 5. Hướng dẫn Frontend

- **Thời điểm gọi API**: Nên gọi API profile ngay sau khi đăng nhập thành công hoặc khi ứng dụng khởi tạo (nếu đã có token lưu trong LocalStorage) để hiển thị tên và email người dùng trên Header/Sidebar.
- **Xử lý lỗi**: Nếu API trả về 401 (Unauthorized), Frontend nên thực hiện luồng đăng xuất (Clear token và chuyển về trang Login).
