# Tài liệu: Logic Tạo Kế Hoạch Thủ Công (Manual Plan)

Tài liệu này giải thích chi tiết quy trình và logic nghiệp vụ phía Backend cho việc tạo kế hoạch thủ công, giúp Frontend (FE) triển khai chính xác các luồng tương tác.

## 1. Quy trình tổng quan
Quy trình tạo kế hoạch thủ công gồm 2 giai đoạn chính:
1. **Khởi tạo kế hoạch:** Tạo phần khung (shell) của kế hoạch (Tiêu đề, mô tả, deadline...).
2. **Thêm nhiệm vụ (Tasks):** Thêm các đầu việc vào kế hoạch đã tạo. Hệ thống hỗ trợ cấu trúc phân cấp (Task cha - Task con).

---

## 2. Giai đoạn 1: Khởi tạo kế hoạch
**Endpoint:** `POST /api/Plans`  
**Header:** `Authorization: Bearer {token}`

### Cấu trúc Request (CreatePlanDto):
```json
{
  "title": "Kế hoạch học tập React",
  "description": "Lộ trình học React từ cơ bản đến nâng cao",
  "goal": "Master React Hooks và Redux",
  "templateId": null,
  "frameworkId": null,
  "categoryId": "guid-category-id",
  "isPublic": false,
  "deadline": "2026-12-31T23:59:59"
}
```

### Logic Backend:
- Gán `UserId` từ Token của người dùng đang đăng nhập.
- Mặc định `IsAIGenerated = false` (vì đây là tạo thủ công).
- Mặc định `Status = "active"` và `Progress = 0`.

---

## 3. Giai đoạn 2: Thêm nhiệm vụ (Tasks)
**Endpoint:** `POST /api/Plans/{planId}/tasks`

### Cấu trúc Request (CreatePlanTaskDto):
```json
{
  "title": "Học React Cơ Bản",
  "parentTaskId": null, 
  "description": "Tìm hiểu về JSX, Components, Props",
  "priority": "high",
  "startDate": "2026-06-01T08:00:00",
  "dueDate": "2026-06-15T17:00:00",
  "orderIndex": 1
}
```

### Cấu trúc phân cấp (Hierarchy):
- **Task gốc (Root Task):** Để `parentTaskId: null`.
- **Task con (Sub-task):** Gán `parentTaskId` là `Id` của task cha.
- **Lưu ý:** Hiện tại logic tính toán tiến độ (Progress) hỗ trợ tốt nhất cho **2 cấp** (Cha - Con).

---

## 4. Logic Tính Toán Tiến Độ (Quan trọng cho FE)
Phía Backend có logic tự động tính toán lại tiến độ (`Progress`) của Task cha và toàn bộ Kế hoạch mỗi khi có sự thay đổi.

### Quy tắc cập nhật trạng thái (UpdateTaskStatus):
**Endpoint:** `PUT /api/Plans/{planId}/tasks/{taskId}/status`
```json
{
  "status": "done" 
}
```
- Nếu `status == "done"`: Hệ thống tự động set `progress = 100` và `completedAt = Now`.
- Nếu `status != "done"`: Nếu trước đó progress là 100 thì sẽ bị reset về 0.

### Thuật toán Recalculate (Mô tả logic trong `PlanService.cs`):
Mỗi khi một task được cập nhật hoặc thêm mới:
1. **Tính Progress Task Cha:**
   - Lấy trung bình cộng (`Average`) Progress của tất cả các Task con.
   - Nếu trung bình = 100% -> Task cha tự động chuyển thành `done`.
   - Nếu trung bình < 100% mà trước đó là `done` -> Chuyển lại thành `in_progress`.
2. **Tính Progress Kế hoạch (Plan):**
   - Lấy trung bình cộng (`Average`) Progress của tất cả các **Task gốc** (những task không có cha).
   - Cập nhật `Progress` của Plan và tự động chuyển trạng thái Plan sang `done` nếu đạt 100%.

> **Lời khuyên cho FE:** FE không cần tự tính toán Progress khi hiển thị danh sách, hãy luôn lấy giá trị `progress` trả về từ API vì Backend đã xử lý logic đồng bộ này.

---

## 5. Trích dẫn Code logic xử lý (C#)
```csharp
// Logic tính trung bình cộng trong PlanService.cs
private async Task RecalculatePlanProgressAsync(Guid planId)
{
    var tasks = plan.Tasks;
    var level1Tasks = tasks.Where(t => t.ParentTaskId == null).ToList();
    var subtasks = tasks.Where(t => t.ParentTaskId != null).ToList();

    // 1. Tính cho Task cha dựa trên task con
    foreach (var parent in level1Tasks)
    {
        var children = subtasks.Where(t => t.ParentTaskId == parent.Id).ToList();
        if (children.Any())
        {
            parent.Progress = (int)children.Average(c => c.Progress);
            // Tự động cập nhật status task cha dựa trên progress...
        }
    }

    // 2. Tính cho Plan dựa trên các task gốc (level 1)
    if (level1Tasks.Any())
    {
        plan.Progress = (int)level1Tasks.Average(t => t.Progress);
    }
}
```
