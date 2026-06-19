# FastAPI - Prototype for Way 2: Zalo OA Webhook Chatbot (Lightweight Backend)
# This simulates a direct webhook integration for Zalo OA without needing a full-blown React Zalo Mini App.

from fastapi import FastAPI, Request, BackgroundTasks
import httpx
import re
import json

app = FastAPI(title="Zalo OA Webhook Mock")

ZALO_OA_API_URL = "https://openapi.zalo.me/v3.0/oa/message"
ZALO_ACCESS_TOKEN = "MOCK_ACCESS_TOKEN"

# Mock database of properties
MOCK_PROPERTIES = [
    {"id": "OP1-S01", "project": "Ocean Park 1", "type": "Studio", "price": 1500000000, "area": "32m²", "direction": "Đông Nam"},
    {"id": "OP1-1N02", "project": "Ocean Park 1", "type": "1PN+", "price": 2300000000, "area": "48m²", "direction": "Tây Nam"},
    {"id": "OP1-2N03", "project": "Ocean Park 1", "type": "2PN", "price": 3100000000, "area": "65m²", "direction": "Đông Nam"},
]

def calculate_monthly_payment(principal: float, years: int, rate: float = 0.085) -> float:
    """Calculate monthly principal + interest payment using PMT formula"""
    if principal <= 0:
        return 0
    monthly_rate = rate / 12
    months = years * 12
    return principal * (monthly_rate * (1 + monthly_rate)**months) / ((1 + monthly_rate)**months - 1)

async def send_zalo_message(user_id: str, text: str):
    """Sends a reply text back to the Zalo User via Zalo OpenAPI"""
    headers = {
        "access_token": ZALO_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "recipient": {"user_id": user_id},
        "message": {"text": text}
    }
    # In prototype: we print the request payload instead of calling the live Zalo API (which needs active credentials)
    print(f"--- Sending Message to Zalo User {user_id} ---")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print("---------------------------------------------")

async def process_user_intent(user_id: str, message_text: str):
    """Analyses the chat content and generates a reply"""
    message_text = message_text.lower().strip()
    
    # 1. Check for financial calculation intent (e.g. "tính trả góp 2 tỷ vay 15 năm")
    # Regular expression to extract price and years
    price_match = re.search(r"tính trả góp ([\d\.,]+)\s*(tỷ|trieu|tr)", message_text)
    years_match = re.search(r"vay (\d+)\s*năm", message_text)
    
    if price_match:
        raw_price = float(price_match.group(1).replace(",", "."))
        unit = price_match.group(2)
        price_vnd = raw_price * 1000000000 if "tỷ" in unit else raw_price * 1000000
        
        years = int(years_match.group(1)) if years_match else 15
        
        # Calculate payment assuming 30% down payment (70% loan)
        loan_amount = price_vnd * 0.70
        down_payment = price_vnd * 0.30
        monthly_est = calculate_monthly_payment(loan_amount, years)
        
        response = (
            f"📊 [Dự tính trả góp cho căn {raw_price} {unit} - thời hạn vay {years} năm]\n\n"
            f"• Vốn tự có (30%): {down_payment/1000000000:.2f} tỷ VND\n"
            f"• Khoản vay ngân hàng (70%): {loan_amount/1000000000:.2f} tỷ VND\n"
            f"• Lãi suất dự kiến: 8.5%/năm\n"
            f"👉 Trả góp hàng tháng khoảng: {monthly_est/1000000:.1f} triệu/tháng.\n\n"
            f"Để nhận bảng tính chi tiết dư nợ giảm dần qua Zalo, vui lòng soạn tin nhắn: 'SĐT + [Số điện thoại của bạn]'!"
        )
        await send_zalo_message(user_id, response)
        return
        
    # 2. Check for lead registration (e.g. "SĐT 0912345678")
    phone_match = re.search(r"(sđt|sdt|số điện thoại|liên hệ)\s*(\d{9,11})", message_text)
    if phone_match:
        phone_num = phone_match.group(2)
        # Log Lead to simulated DB
        print(f"🎉 NEW LEAD EXTRACTED VIA WEBHOOK: User {user_id} - Phone: {phone_num}")
        response = "Dạ cảm ơn anh/chị. Em đã ghi nhận yêu cầu tư vấn. Sales bên em sẽ liên hệ qua số điện thoại này trong vòng 5 phút ạ!"
        await send_zalo_message(user_id, response)
        return
        
    # Default Fallback (Simple AI consultant response)
    fallback_response = (
        "Chào anh/chị! Em là Trợ lý AI BĐS Thành Trung. Em có thể hỗ trợ:\n"
        "1. Tra cứu giỏ căn đang trống (gõ: 'tìm căn Ocean Park')\n"
        "2. Tính dòng tiền trả góp vay mua nhà (gõ: 'tính trả góp 2.5 tỷ vay 15 năm')\n"
        "Anh/chị cần em hỗ trợ nội dung nào ạ?"
    )
    await send_zalo_message(user_id, fallback_response)

@app.post("/webhook")
async def zalo_webhook(request: Request, background_tasks: BackgroundTasks):
    """Entry point for Zalo OA Webhook events"""
    try:
        body = await request.json()
        print("Webhook Received:", json.dumps(body, indent=2))
        
        # Check event structure
        event_name = body.get("event_name")
        if event_name == "user_send_text":
            user_id = body.get("sender", {}).get("id")
            message_text = body.get("message", {}).get("text", "")
            
            # Process in background to reply instantly to Zalo server (avoiding timeout)
            background_tasks.add_task(process_user_intent, user_id, message_text)
            
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Local test block
if __name__ == "__main__":
    import uvicorn
    import asyncio
    print("Testing Zalo Webhook calculation locally...")
    # Simulate a user message
    asyncio.run(process_user_intent("zalo-user-123", "tính trả góp 2.5 tỷ vay 20 năm"))
