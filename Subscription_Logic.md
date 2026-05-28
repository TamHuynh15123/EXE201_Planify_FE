# Tài liệu chi tiết Logic Subscription & AdminSubscriptions - Planify

Tài liệu này mô tả chi tiết cấu trúc dữ liệu, luồng xử lý và các quy tắc nghiệp vụ liên quan đến quản lý gói dịch vụ (Subscription) trong hệ thống Planify.

---

## 1. Cấu trúc Thực thể (Entities)

Hệ thống sử dụng 3 thực thể chính để quản lý Subscription:

### 1.1 SubscriptionPlan
Định nghĩa các gói dịch vụ có sẵn trong hệ thống.
- **Id**: Mã định danh duy nhất.
- **Name**: Tên gói (ví dụ: Free, Pro, Premium).
- **Price**: Giá của gói (VND).
- **BillingCycle**: Chu kỳ thanh toán (`monthly`, `yearly`, `lifetime`).
- **AiRequestsLimit**: Giới hạn số lượng yêu cầu AI mỗi tháng.
- **StorageLimitMb**: Giới hạn dung lượng lưu trữ (MB).
- **MaxPlans**: Số lượng kế hoạch tối đa được tạo.
- **Features**: Danh sách các tính năng đi kèm (dưới dạng chuỗi hoặc JSON).
- **IsActive**: Trạng thái gói có đang kinh doanh hay không.

### 1.2 UserSubscription
Theo dõi gói dịch vụ mà người dùng đang sử dụng.
- **UserId**: ID của người dùng.
- **PlanId**: ID của gói dịch vụ đang dùng.
- **Status**: Trạng thái (`active`, `expired`, `cancelled`, `pending`).
- **StartedAt**: Ngày bắt đầu.
- **ExpiresAt**: Ngày hết hạn.
- **AiRequestsUsed**: Số lượng yêu cầu AI đã sử dụng trong chu kỳ hiện tại.
- **CancelledAt**: Ngày hủy gói (nếu có).

### 1.3 PaymentTransaction
Lưu vết các giao dịch thanh toán nâng cấp gói.
- **Amount**: Số tiền thanh toán.
- **Status**: Trạng thái giao dịch (`success`, `failed`, `pending`).
- **PaymentMethod**: Phương thức thanh toán (ví dụ: MoMo, VNPAY, Credit Card).
- **PaidAt**: Thời điểm hoàn tất thanh toán.

---

## 2. Logic dành cho Admin (AdminSubscriptions)

Quản lý thông qua `AdminSubscriptionsController` với quyền truy cập `[Authorize(Roles = "Admin")]`.

### 2.1 Xem tất cả gói dịch vụ
- **Endpoint**: `GET /api/admin/subscriptions/plans`
- **Logic**: Lấy toàn bộ danh sách `SubscriptionPlan` trong database, sắp xếp theo giá tăng dần. Bao gồm cả các gói đã bị vô hiệu hóa (`IsActive = false`).

### 2.2 Tạo gói dịch vụ mới
- **Endpoint**: `POST /api/admin/subscriptions/plans`
- **Logic**: 
    - Kiểm tra tên gói đã tồn tại chưa (không phân biệt hoa thường).
    - Tạo thực thể mới với các thông số giới hạn (AI, Storage, Plans).
    - Trả về mã lỗi 400 nếu tên trùng.

### 2.3 Cập nhật gói dịch vụ
- **Endpoint**: `PUT /api/admin/subscriptions/plans/{id}`
- **Logic**: 
    - Tìm gói theo `id`.
    - Kiểm tra tên mới có bị trùng với gói khác hay không.
    - Cập nhật các thông số và thời gian `UpdatedAt`.

### 2.4 Vô hiệu hóa gói dịch vụ
- **Endpoint**: `DELETE /api/admin/subscriptions/plans/{id}`
- **Logic**: Chuyển trạng thái `IsActive` thành `false`. Không xóa cứng dữ liệu để đảm bảo tính toàn vẹn cho các `UserSubscription` cũ.

---

## 3. Logic dành cho Người dùng (Subscriptions)

Quản lý thông qua `SubscriptionsController` với quyền truy cập `[Authorize]`.

### 3.1 Xem danh sách gói đang hoạt động
- **Endpoint**: `GET /api/subscriptions/plans`
- **Logic**: Chỉ lấy các gói có `IsActive = true`. Người dùng dùng danh sách này để lựa chọn nâng cấp.

### 3.2 Lấy thông tin gói hiện tại
- **Endpoint**: `GET /api/subscriptions/current`
- **Logic đặc biệt**:
    1. Tìm gói của người dùng có trạng thái `active`.
    2. **Tự động cấp gói Free**: Nếu người dùng chưa có gói nào, hệ thống tự động tạo một bản ghi `UserSubscription` với gói "Free" (nếu Admin đã cấu hình gói này).
    3. **Xử lý hết hạn**: Nếu gói hiện tại đã quá `ExpiresAt`, hệ thống chuyển trạng thái sang `expired` và thực hiện lại bước (2) để đưa người dùng về gói mặc định.

### 3.3 Nâng cấp/Mua gói dịch vụ
- **Endpoint**: `POST /api/subscriptions/upgrade`
- **Input**: `PlanId` và `PaymentMethod`.
- **Luồng xử lý**:
    1. Kiểm tra gói mới có tồn tại và đang `active` không.
    2. Hủy (`cancelled`) tất cả các gói `active` hiện tại của người dùng.
    3. Tính toán ngày hết hạn (`ExpiresAt`) dựa trên `BillingCycle` của gói mới:
        - `monthly`: +1 tháng.
        - `yearly`: +1 năm.
        - Khác: Không hết hạn (null).
    4. Tạo bản ghi `UserSubscription` mới với trạng thái `active` và reset `AiRequestsUsed = 0`.
    5. **Mô phỏng thanh toán**: Tạo một bản ghi `PaymentTransaction` với trạng thái `success` để lưu vết doanh thu.

---

## 4. Các Quy tắc Nghiệp vụ quan trọng (Business Rules)

1. **Ưu tiên gói Free**: Luôn phải có ít nhất một gói tên là "Free" trong hệ thống để phục vụ logic tự động gán gói cho người dùng mới hoặc người dùng hết hạn gói trả phí.
2. **Không ghi đè Subscription**: Khi nâng cấp, hệ thống không cập nhật bản ghi cũ mà hủy bản ghi cũ và tạo bản ghi mới để giữ lịch sử sử dụng.
3. **Giới hạn AI**: Số lượng `AiRequestsUsed` được dùng để kiểm tra quyền hạn trong `AiChatController` trước khi gọi đến service AI.
4. **Trạng thái Subscription**: 
    - `active`: Đang sử dụng bình thường.
    - `expired`: Đã hết hạn theo thời gian.
    - `cancelled`: Bị hủy do người dùng nâng cấp sang gói khác hoặc yêu cầu hủy.

---

## 5. Hướng dẫn Frontend: Điều hướng & Tài khoản Admin

Dựa trên dữ liệu từ `DataSeeder`, Frontend cần lưu ý các thông tin sau để thực hiện logic điều hướng.

### 5.1 Thông tin tài khoản Admin mặc định
Dùng tài khoản này để đăng nhập và kiểm tra các tính năng quản trị:
- **Email**: `admin123@gmail.com`
- **Password**: `Abc123@`

### 5.2 Logic điều hướng sau khi đăng nhập
Sau khi gọi API `/api/auth/login` (hoặc `/api/auth/google-login`), Backend sẽ trả về Token (JWT). Frontend nên thực hiện các bước sau:

1. **Giải mã Token (Decode JWT)**: Lấy thông tin `role` từ claims trong token.
2. **Kiểm tra quyền**:
   - Nếu `role` chứa `"Admin"`: Điều hướng người dùng về trang **Admin Dashboard** (ví dụ: `/admin/dashboard`).
   - Nếu `role` chỉ chứa `"User"`: Điều hướng về trang **User Home/Dashboard** (ví dụ: `/dashboard` hoặc `/`).
3. **Bảo vệ Route (Route Guards)**:
   - Các trang bắt đầu bằng `/admin/*` phải có guard kiểm tra role `Admin`.
   - Nếu User bình thường cố truy cập, hãy điều hướng về trang 403 (Forbidden) hoặc trang Home.

### 5.3 Gợi ý luồng xử lý Admin
- Tại trang Admin Dashboard, hiển thị menu quản lý Subscription Plan.
- Sử dụng các API tại `api/admin/subscriptions/plans` để hiển thị danh sách, thêm, sửa, hoặc vô hiệu hóa các gói.
