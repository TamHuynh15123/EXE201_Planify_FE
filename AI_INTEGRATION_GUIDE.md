# Planify AI - Tài liệu Tích hợp Front-End

Tài liệu này hướng dẫn cách kết nối và sử dụng các tính năng AI (OpenAI gpt-4o-mini) trong hệ thống Planify.

## 1. Tổng quan
Hệ thống AI của Planify hỗ trợ 2 tính năng chính:
- **AI Chat**: Hội thoại trực tiếp về chủ đề lập kế hoạch.
- **AI Generate Plan**: Tự động phân tích yêu cầu tự do của người dùng để tạo ra một kế hoạch đầy đủ (Tasks & Subtasks) và lưu dưới dạng bản nháp (Draft).

---

## 2. Quy định chung
- **Base URL**: `{{SERVER_URL}}/api/ai`
- **Xác thực**: Tất cả các Endpoint đều yêu cầu header `Authorization: Bearer {token}`.
- **Ngôn ngữ**: AI được cấu hình để ưu tiên phản hồi bằng **Tiếng Việt**.
- **Chủ đề**: AI chỉ trả lời các câu hỏi liên quan đến lập kế hoạch, mục tiêu, quản lý công việc. Các chủ đề khác sẽ bị từ chối lịch sự.

---

## 3. Các Endpoint Chi tiết

### 3.1. AI Chat (Hội thoại)
Dùng để tạo khung chat tư vấn, hỏi đáp về kế hoạch.

- **URL**: `/chat`
- **Method**: `POST`
- **Request Body**:
```json
{
  "message": "Tôi nên bắt đầu học IELTS như thế nào?",
  "history": [
    { "role": "user", "content": "Chào Planify AI" },
    { "role": "assistant", "content": "Chào bạn! Tôi có thể giúp gì cho bạn trong việc lập kế hoạch hôm nay?" }
  ]
}
```
*Ghi chú: `history` là không bắt buộc. Để AI nhớ ngữ cảnh, FE nên gửi tối đa 6 lượt hội thoại gần nhất.*

- **Response (Success 200)**:
```json
{
  "reply": "Để bắt đầu học IELTS, bạn nên xác định trình độ hiện tại, đặt mục tiêu cụ thể và chia nhỏ lộ trình theo từng kỹ năng...",
  "model": "gpt-4o-mini",
  "elapsedMs": 1250
}
```

---

### 3.2. AI Generate Plan (Tạo kế hoạch tự động)
Dùng khi người dùng nhập một câu yêu cầu tự do (Prompt) và muốn AI tự thiết kế toàn bộ các bước thực hiện.

- **URL**: `/generate-plan`
- **Method**: `POST`
- **Request Body**:
```json
{
  "prompt": "Tôi muốn học IELTS 6.5 trước tháng 8/2026, hiện tại đang ở band 5.0"
}
```
*Ghi chú: Prompt nên dài tối thiểu 10 ký tự.*

- **Response (Success 200)**:
Hệ thống sẽ tự động lưu kế hoạch vào DB với trạng thái `draft` và trả về thông tin chi tiết.

```json
{
  "planId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "plan": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Lộ trình chinh phục IELTS 6.5",
    "description": "Kế hoạch chi tiết từ band 5.0 lên 6.5 trước tháng 8/2026",
    "goal": "IELTS 6.5",
    "status": "draft",
    "deadline": "2026-08-01T00:00:00Z",
    "progress": 0,
    "isAIGenerated": true,
    "draftExpiresAt": "2026-05-31T06:39:41Z",
    "tasks": [
      {
        "id": "...",
        "title": "Củng cố nền tảng ngữ pháp và từ vựng",
        "priority": "high",
        "status": "todo",
        "subTasks": [
          { "title": "Học 20 từ vựng chủ đề Academic mỗi ngày", "priority": "medium" }
        ]
      }
    ]
  },
  "message": "Kế hoạch học IELTS của bạn đã sẵn sàng!",
  "model": "gpt-4o-mini",
  "elapsedMs": 5400
}
```

### 3.3. Xác nhận hoặc Hủy bản nháp (Draft Plan)
Sau khi gọi `/api/ai/generate-plan`, kế hoạch nằm ở trạng thái `draft`. FE cần gọi các endpoint sau để hoàn tất:

#### A. Xác nhận kế hoạch
Chuyển trạng thái kế hoạch từ `draft` sang `active`.
- **URL**: `/api/plans/{planId}/confirm`
- **Method**: `POST`
- **Response**: `{ "message": "Kế hoạch đã được xác nhận!", "plan": { ... } }`

#### B. Hủy bản nháp
Xóa hoàn toàn kế hoạch draft nếu người dùng không ưng ý.
- **URL**: `/api/plans/{planId}/draft`
- **Method**: `DELETE`
- **Response**: `{ "message": "Đã hủy bản nháp kế hoạch." }`

---

## 4. Cơ chế Bản nháp (Draft Plan)
Khi gọi `/api/ai/generate-plan`:
1. Kế hoạch được tạo ra sẽ có `status: "draft"`.
2. Kế hoạch này **sẽ tự động bị xóa** sau 24 giờ nếu không được xác nhận (dựa vào `draftExpiresAt`).
3. **Luồng FE khuyến nghị**:
   - Gọi `/api/ai/generate-plan` → Nhận dữ liệu Preview.
   - Hiển thị màn hình Preview cho User.
   - Nếu User nhấn **"Lưu kế hoạch"**: Gọi `POST /api/plans/{planId}/confirm`.
   - Nếu User nhấn **"Hủy"**: Gọi `DELETE /api/plans/{planId}/draft`.

---

## 5. Xử lý lỗi thường gặp

| Mã lỗi | Nguyên nhân | Hướng xử lý |
| :--- | :--- | :--- |
| **400** | Message/Prompt trống hoặc quá ngắn. | Hiển thị thông báo validation cho user. |
| **401** | Token hết hạn hoặc không hợp lệ. | Yêu cầu user đăng nhập lại. |
| **408** | AI xử lý quá lâu (Timeout > 120s). | Hiển thị thông báo "Hệ thống đang bận, vui lòng thử lại sau". |
| **503** | OpenAI API bị lỗi hoặc quá tải. | Thông báo tính năng AI tạm thời không khả dụng. |

---

## 6. Mẹo cho Front-End
1. **Loading State**: Việc tạo kế hoạch AI có thể mất từ 5-10 giây. Hãy sử dụng các component Loading hoặc Skeleton phù hợp để tăng trải nghiệm.
2. **Streaming**: Hiện tại API trả về kết quả sau khi AI hoàn tất toàn bộ (không streaming). 
3. **Context**: Trong phần Chat, hãy giới hạn `history` gửi lên để tiết kiệm băng thông và tăng tốc độ xử lý (6-8 tin nhắn gần nhất là tối ưu).
