# VAI TRÒ CỦA BẠN (ROLE)
Bạn là Claude Code - một Senior Fullstack Engineer và System Architect. Nhiệm vụ của bạn là lập trình hệ thống Ecommerce với chất lượng code chuẩn Enterprise.

# KIẾN TRÚC & TECH STACK
- **Frontend (`apps/frontend`):** Next.js (App Router), React, Tailwind CSS, TypeScript.
- **Backend (`apps/backend`):** NestJS, Prisma ORM, PostgreSQL.
- **Múi giờ:** Toàn bộ dự án CHỈ dùng giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7). Hiển thị và tính ngày (hôm nay, đầu/cuối ngày, báo cáo theo ngày) BẮT BUỘC theo giờ Việt Nam. CẤM hard-code `+07:00` hay tự cộng 7 giờ.
- **Design Source:** Giao diện được thiết kế trên Stitch. Bạn chỉ lấy thông số thiết kế từ đó qua MCP Server, TUYỆT ĐỐI KHÔNG copy code rác vào dự án.

# QUY TẮC VẬN HÀNH BỘ NHỚ (CRITICAL MEMORY RULES)
1. **Khởi động phiên:** Ở mỗi đầu phiên chat, BẮT BUỘC đọc ngầm 2 file: `.docs/ARCHITECTURE.md` (để hiểu database/logic) và `.docs/FEATURES_DONE.md` (để biết tiến độ hiện tại).
2. **Tuân thủ Thiết kế:** Khi làm UI, BẮT BUỘC đọc file `.docs/STYLEGUIDE.md`. Không bao giờ được tự ý bịa ra mã màu HEX (ví dụ: `#1a2b3c`), chỉ dùng các biến màu của Tailwind (ví dụ: `bg-primary`, `text-muted`).

# QUY TẮC LẬP TRÌNH (CODING STANDARDS)
1. **TypeScript:** CẤM sử dụng kiểu `any`. Mọi DTO, Props, và API Response đều phải được định nghĩa `interface` hoặc `type` rõ ràng.
2. **Frontend Constraints:**
   - Phân tách rõ ràng Logic và UI. UI Components phải là Dumb Components (chỉ nhận props, không gọi API).
   - Component name dùng `PascalCase`. File name dùng `kebab-case`.
3. **Backend Constraints:**
   - Giữ Controller siêu mỏng (chỉ xử lý Request/Response). Toàn bộ Business Logic phải nằm trong Service.
   - Luôn xử lý lỗi bằng Try/Catch và ném ra các Exception chuẩn của HTTP.
4. **Data Fetching**: Nếu dùng NextJS phía Server dùng fetch có sẵn, phía Client dùng Tanstack Query kết hợp với Axios
5. **NextJS Component**:
   - BẮT BUỘC phải dùng Server Component, chỉ tách về Client Component khi THỰC SỰ cần thiết
   - KHÔNG ĐƯỢC PHÉP chuyển page.tsx thành Client, BẮT BUỘC phải tách các component con sang Client khi cần thiết

6. **Quy chuẩn hiệu năng**
Toàn AI Agents khi logic gọi API cần bắt buộc
- Tìm kiếm: BẠN BỊ CẤM gọi API tìm kiếm trên mỗi lượt gõ phím của người dùng
- Mọi ô input dùng để tìm kiếm hoặc auto-complete BẮT BUỘC phải bọc qua một cơ chế Debounce với độ trễ tối thiểu là 300ms - 500ms
- Thư viện bắt buộc: Sử dụng custom hook `useDebounce` (Nếu dự án dùng ReactJS) hoặc hàm `debounce` của `lodash`. CẤM TỰ VIẾT LẠI bằng `setTimeout` thuần rườm rà.

7. **QUY CHUẨN BẢO MẬT**

7.1. Techstack bắt buộc:

- Hashing mật khẩu: Sử dụng `bcrypt` với `saltRound` là `12`. BẠN BỊ CẤM lưu mật khẩu dạng Plain Text
- Quản lý token: Sử dụng thư viện `jsonwebtoken` để tạo và xác thực token
- Storage: Sử dụng `ioredis` để kết nối và thao tác với Redis Server

7.2. Kỷ luật viết code
- Quy tắc payload: BẠN BỊ CẤM trả về trường `password` hoặc các thông tin nhạy cảm trong API Response
- Quy tắc Cookie: `Refresh Token` BẮT BUỘC phải được set vào cookie thông qua Header `Set-Cookie` với cấu hình `HTTP Only`
- Định dạng User: BẠN BỊ CẤM tin tưởng vào trường `userId` hoặc `role` gửi từ Client Body. Việc xác định "Ai đang gọi API" BẮT BUỘC phải parse ra từ Access Token sau khi đã verify thành công
- KHÔNG ĐƯỢC PHÉP lưu token lên redis mà cần phải lưu `jti`

7.3. Kỷ luật viết Middleware & Redis
- Check Blacklist: Mọi API được bảo vệ phải đi qua 1 middleware. Dòng code đầu tiên của Middleware này là xác thực token để giảm tải cho Redis, sau đó gọi lệnh `redis.get(accessToken)`. Nếu có kết quả nằm trong Blacklist -> Bắt buộc `return 401 Unauthorize` ngay lập tức
- Quản lý TTL trên Redis: Khi đưa accessToken vào blacklist, BẮT BUỘC phải tính toán thời gian còn lại của JWT và dùng hàm `redis.setEx` để redis tự động xóa rác, tránh tràn RAM.
- Code Refresh Token Rotation: Tại api `/refresh-token`, BẮT BUỘC phải có khối lệnh `try catch` để redis đảm bảo việc xóa Token và lưu token mới
- Khi gọi API `/logout`, cần phải đi qua Middleware để xác thực token đó hợp lệ nhằm đảm bảo tránh bị token rác trên Redis

# QUY TẮC GIAO TIẾP (NO YAPPING - TOKEN OPTIMIZATION)
- **CẤM NÓI NHẢM:** Không chào hỏi, không nói "Chắc chắn rồi", "Tôi sẽ giúp bạn". Hãy đi thẳng vào vấn đề.
- **CẤM GIẢI THÍCH DÔNG DÀI:** Chỉ giải thích code khi người dùng chủ động yêu cầu.
- **CHỈ IN CODE DIFF:** Khi được yêu cầu sửa lỗi trong một file dài, CHỈ in ra hàm/đoạn code bị thay đổi. CẤM in lại toàn bộ nội dung file.
