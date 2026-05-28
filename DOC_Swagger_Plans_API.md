# Tài liệu Swagger API: Phân hệ Kế hoạch (Plans)

Tài liệu này phân tích chi tiết các API trong `PlansController`, bao gồm tham số, logic xử lý và cách sử dụng thực tế thông qua giao diện Swagger.

---

## 1. POST /api/Plans
**Mục tiêu:** Khởi tạo một bản ghi kế hoạch mới (thường là bước đầu tiên trong luồng tạo thủ công).

### Tham số Body (CreatePlanDto):
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `title` | string | Có | Tiêu đề của kế hoạch. |
| `description` | string | Không | Mô tả chi tiết mục đích. |
| `goal` | string | Không | Mục tiêu cụ thể cần đạt được. |
| `categoryId` | Guid | Không | ID danh mục (Học tập, Công việc, v.v.). |
| `deadline` | DateTime | Không | Hạn chót hoàn thành kế hoạch. |
| `isPublic` | boolean | Không | `true` nếu muốn chia sẻ công khai. Mặc định `false`. |
| `templateId` | Guid | Không | ID của Template mẫu (nếu tạo từ mẫu). |
| `frameworkId` | Guid | Không | ID của Framework áp dụng (nếu có). |

### Phản hồi (Response):
- **201 Created:** Trả về đối tượng `PlanDto` vừa tạo (bao gồm `Id`).
- **401 Unauthorized:** Nếu chưa đính kèm Token hoặc Token hết hạn.

---

## 2. POST /api/Plans/{planId}/tasks
**Mục tiêu:** Thêm một nhiệm vụ (Task) mới vào kế hoạch đã có.

### Tham số Path:
- `planId`: ID của kế hoạch (Lấy từ bước 1).

### Tham số Body (CreatePlanTaskDto):
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `title` | string | Có | Tên nhiệm vụ. |
| `description` | string | Không | Mô tả chi tiết công việc. |
| `parentTaskId` | Guid | Không | ID của Task cha (nếu đây là sub-task). |
| `priority` | string | Không | `high`, `medium`, `low`. Mặc định `medium`. |
| `startDate` | DateTime | Không | Ngày bắt đầu. |
| `dueDate` | DateTime | Không | Hạn chót của task. |
| `orderIndex` | int | Không | Thứ tự hiển thị (0, 1, 2...). |

### Logic đặc biệt:
- **Tự động tính lại Progress:** Khi thêm task mới, `progress` của Plan sẽ được tính lại dựa trên trung bình cộng của các task gốc (level 1).

---

## 3. PUT /api/Plans/{planId}/tasks/{taskId}/status
**Mục tiêu:** Cập nhật trạng thái hoàn thành của một nhiệm vụ.

### Tham số Path:
- `planId`: ID của kế hoạch.
- `taskId`: ID của nhiệm vụ cần cập nhật.

### Tham số Body (UpdateTaskStatusDto):
```json
{
  "status": "done" // Các giá trị: todo, in_progress, done, cancelled
}
```

### Logic xử lý tại Backend:
1. **Nếu status = "done":**
   - Tự động set `progress = 100`.
   - Gán `completedAt` bằng thời gian hiện tại.
2. **Nếu status != "done":**
   - Nếu trước đó đang là 100% thì reset về 0%.
   - Xóa `completedAt`.
3. **Trigger Recalculate:** Sau khi lưu, BE sẽ gọi hàm tính toán lại tiến độ cho Task cha (nếu có) và toàn bộ Plan.

---

## 4. GET /api/Plans/{id}
**Mục tiêu:** Lấy toàn bộ thông tin chi tiết của một kế hoạch, bao gồm cả cây danh sách nhiệm vụ.

### Phản hồi (PlanDto):
Dữ liệu trả về sẽ có cấu trúc cây (Tree structure) ở trường `tasks`:
```json
{
  "id": "guid",
  "title": "...",
  "progress": 45,
  "tasks": [
    {
      "id": "task-1",
      "title": "Task cha 1",
      "subTasks": [
        { "id": "sub-task-1.1", "title": "Task con" }
      ]
    }
  ]
}
```

---

## 5. Hướng dẫn sử dụng trên Swagger UI

1. **Authorize:**
   - Bấm nút **Authorize** ở góc trên bên phải.
   - Nhập: `Bearer {your_access_token}`.
2. **Tạo Plan:**
   - Tìm `POST /api/Plans`, chọn **Try it out**.
   - Nhập JSON và thực thi để lấy `id` của kế hoạch.
3. **Thêm Task:**
   - Dùng `id` vừa lấy được điền vào `planId` của endpoint `POST /api/Plans/{planId}/tasks`.
   - Để tạo sub-task: Lấy `id` của một task đã tạo trước đó điền vào trường `parentTaskId`.
4. **Kiểm tra kết quả:**
   - Gọi `GET /api/Plans/{id}` để thấy cấu trúc lồng nhau (subTasks) và phần trăm tiến độ (`progress`) đã được BE tự động tính toán.
