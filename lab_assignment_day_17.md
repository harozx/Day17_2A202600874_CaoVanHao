# 📋 Báo Cáo Nghiên Cứu Lab Assignment Day 17: Kiểm Thử Giả Thuyết Tối Ưu Chi Phí
**Dự án:** HA Group - Trợ Lý AI Tư Vấn Bất Động Sản Đa Kênh (HomeSeeker AI)  
**Nhóm phát triển:** C2-App-059 (Cao Văn Hảo, Đỗ Quốc An)

---

## 🎯 1. Giả Thuyết Quan Trọng Nhất (The Core Hypothesis)
> **"Khách hàng có nhu cầu mua/thuê nhà muốn được tự tra cứu thông tin quỹ căn hộ và tự tính toán dòng tiền trả góp vay ngân hàng một cách riêng tư (qua chatbot AI) trước khi họ sẵn sàng chia sẻ Số điện thoại/Thông tin liên hệ cho nhân viên Sales."**

### Lý do lựa chọn giả thuyết này:
*   **Giải quyết Pain Point lớn nhất của khách hàng:** Khách hàng rất e ngại việc bị rò rỉ thông tin cá nhân và bị làm phiền liên tục bởi các cuộc gọi chào mời (telesale spam) khi chỉ mới đang ở bước tìm hiểu thông tin ban đầu.
*   **Quyết định sự thành bại của Phễu khách hàng (TOFU):** Nếu khách hàng cảm thấy việc tra cứu thông tin là riêng tư, an toàn và hữu ích, tỷ lệ họ tương tác và chuyển đổi thành Lead thực tế sẽ cao hơn gấp nhiều lần so với các cách thu thập Lead truyền thống (ép điền form ngay lập tức).

---

## 🛠️ 2. Cách Nhóm Đã và Đang Triển Khai (Current Implementation)
Để kiểm chứng giả thuyết này và xây dựng hệ thống hoàn chỉnh, nhóm đã thiết lập cấu trúc hệ thống gồm:
1.  **Giao diện người dùng:** Ứng dụng Zalo Mini App viết bằng React, TypeScript và Vite, tích hợp ZMP SDK để xin quyền thông tin người dùng và xử lý giao diện Glassmorphism mượt mà trên thiết bị di động.
2.  **Bộ máy AI (AI Service):** FastAPI Python tích hợp Google GenAI SDK (Gemini API) sử dụng cơ chế **Function Calling (Tools)** để trích xuất tham số, truy vấn giỏ căn từ database và gọi hàm tính toán lãi suất trả góp chính xác 100%.
3.  **Backend & Database:** Java Spring Boot 3 kết nối MySQL database chạy online trên cloud Railway. Quản lý phân quyền 2 lớp (hạn chế thông tin nhạy cảm ở mức API).
4.  **Sales Dashboard:** Vue.js dashboard tích hợp WebSocket nhận thông báo Lead nóng real-time.

### Chi phí và thời gian triển khai thực tế:
*   **Thời gian:** 3-4 tuần phát triển cho 2 lập trình viên.
*   **Chi phí trực tiếp:** Phí xác thực tài khoản Zalo Developer/OA, phí duy trì cloud server Railway, phí database MySQL online.
*   **Độ phức tạp:** Cao (cần kết nối đồng bộ 3 phân hệ độc lập qua các giao thức HTTP, WebSocket, RAG).

---

## 💡 3. Đề Xuất 3 Phương Án Rẻ Hơn Để Kiểm Chứng Giả Thuyết (3 Cheaper Ways to Test)

Để kiểm chứng giả thuyết trên mà không cần bỏ ra hàng tuần code và chi phí server đắt đỏ, nhóm đề xuất 3 cách tiếp cận tinh gọn (Lean Startup) dưới đây:

### 🌐 Cách 1: Landing Page đơn giản + Chatbot No-Code (Coze/ManyChat) + Google Sheets
*   **Cách thức triển khai:** 
    1. Thiết kế một trang Landing Page giới thiệu ngắn gọn về dự án (ví dụ Vinhomes Ocean Park) bằng các công cụ kéo thả miễn phí (Framer, Wix, hoặc chỉ 1 file HTML tĩnh).
    2. Nhúng một widget Chatbot từ các nền tảng no-code như **Coze** hoặc **ManyChat** (kết nối với API Gemini/GPT-4o mini).
    3. Cấu hình Prompt cho chatbot: Hướng dẫn chatbot tra cứu dữ liệu từ file CSV/Excel tải lên và thực hiện tính toán trả góp theo công thức định sẵn trong prompt. Khi khách hàng đồng ý nhận lịch hẹn, bot hỏi SĐT và đẩy thẳng thông tin này về Google Sheets qua Make.com hoặc webhook đơn giản.
*   **Chi phí:** ~0 USD (sử dụng free tier của Landing page builder, Coze, Make.com).
*   **Thời gian thực hiện:** 1 ngày.

### 💬 Cách 2: Kênh Zalo OA nhúng Kịch Bản Chatbot Tự Động (Rút Gọn Webhook)
*   **Cách thức triển khai:**
    1. Đăng ký một tài khoản Zalo Official Account (OA) miễn phí đại diện cho doanh nghiệp BĐS.
    2. Sử dụng giải pháp chatbot có sẵn tích hợp trên Zalo OA (như ManyChat, FPT.AI) hoặc tự viết một script webhook FastAPI cực kỳ tối giản (chỉ vài chục dòng code).
    3. Webhook này sẽ đón tin nhắn từ khách hàng chat trực tiếp vào Zalo OA, phân tích từ khóa (ví dụ: "cần tìm căn Studio", "tính trả góp căn 2 tỷ") để gọi API tính toán và gửi phản hồi ngay lập tức, bỏ qua hoàn toàn phần giao diện Mini App phức tạp.
*   **Chi phí:** ~0 USD.
*   **Thời gian thực hiện:** 4 - 6 giờ.

### 📊 Cách 3: Google Form thông minh + Google Apps Script (Gửi email phương án trả góp tự động)
*   **Cách thức triển khai:**
    1. Tạo một biểu mẫu Google Form yêu cầu khách hàng chọn dự án quan tâm, nhập ngân sách dự kiến, số tiền tự có, thời hạn vay mong muốn và địa chỉ Email/SĐT nhận báo giá.
    2. Viết một đoạn mã **Google Apps Script (Javascript)** đằng sau biểu mẫu, tự động kích hoạt mỗi khi có khách hàng nhấn nút "Gửi".
    3. Đoạn mã này sẽ tự động tính toán số tiền trả góp hàng tháng, lọc ra 3 căn hộ phù hợp nhất từ một bảng tính Google Sheets lưu trữ giỏ hàng, và gửi một email HTML thiết kế đẹp mắt chứa bảng tính dòng tiền + danh sách căn hộ đề xuất trực tiếp tới hòm thư của khách hàng.
*   **Chi phí:** 0 USD (hoàn toàn miễn phí trên nền tảng Google Workspace).
*   **Thời gian thực hiện:** 2 giờ.

---

## 🛠️ 4. Bản Demo Prototype Nhanh Cho 3 Cách Tiếp Cận (Prototypes)

Nhóm đã xây dựng mã nguồn/giao diện demo chạy được cho cả 3 phương án để sẵn sàng kiểm thử:

### 1️⃣ Prototype cho Cách 1 (Landing Page + Chatbot nhúng)
*   **Mã nguồn:** [index.html](./way1_landing_chatbot/index.html)
*   **Mô tả hoạt động:** Một trang Landing Page tĩnh thiết kế sang trọng tích hợp khung chat ảo. Khách hàng có thể nhấn vào phím tắt nhanh để chat thử, bot sẽ tự động tính toán dòng tiền vay ngân hàng trực quan, lọc căn hộ phù hợp và lưu trực tiếp Lead nóng vào bảng quản trị Sales giả lập (Leads Board Simulator) ngay trên trình duyệt theo thời gian thực.

### 2️⃣ Prototype cho Cách 2 (Zalo OA Webhook FastAPI)
*   **Mã nguồn:** [webhook.py](./way2_zalo_webhook/webhook.py)
*   **Mô tả hoạt động:** Script FastAPI tối giản làm nhiệm vụ đón webhook tin nhắn từ Zalo OA. Nó tự động nhận diện ý định của người dùng (muốn tính trả góp hoặc tìm căn), tự thực hiện tính toán tài chính bằng công thức chuẩn và xuất ra định dạng JSON phản hồi về Zalo API mà không cần cơ sở hạ tầng backend đồ sộ.

### 3️⃣ Prototype cho Cách 3 (Google Apps Script cho Google Form)
*   **Mã nguồn:** [apps_script.js](./way3_google_form_script/apps_script.js)
*   **Mô tả hoạt động:** Đoạn code Javascript sẵn sàng để copy-paste vào phần Script Editor của Google Sheet liên kết với Google Form. File xử lý hoàn chỉnh luồng: nhận sự kiện điền form -> tính toán tài chính PMT -> tìm kiếm giỏ căn -> tạo email HTML và gửi bằng Gmail.

---

## 📊 5. Slide Trình Bày Nhóm (Interactive Presentation Deck)
Để phục vụ buổi trình bày trước nhóm và giảng viên, nhóm đã đóng gói nội dung trên thành một trang slide trình chiếu tương tác hiện đại và sang trọng bằng HTML/CSS:
*   **Link Slide Trình Chiếu:** [slides.html](./presentation/slides.html)
*   *Lưu ý: Bạn chỉ cần click đúp mở file `slides.html` trên trình duyệt Chrome/Edge để bắt đầu thuyết trình với hiệu ứng chuyển slide bằng phím mũi tên hoặc nút bấm.*
