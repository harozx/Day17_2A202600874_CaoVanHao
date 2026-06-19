/**
 * Google Apps Script - Prototype for Way 3: Google Form + Apps Script
 * This script runs on the "Form Submit" trigger of a Google Form.
 * It reads user inputs (budget, loan term, etc.), calculates amortization schedules,
 * filters mock property data, and sends a polished HTML email quotation.
 */

function onFormSubmit(e) {
  try {
    // 1. Extract values from Form Submission
    // Format: e.values is an array of answers in order of the form questions
    var timestamp = e.values[0];
    var email = e.values[1];
    var fullName = e.values[2];
    var phone = e.values[3];
    var project = e.values[4]; // e.g., "Vinhomes Ocean Park 1"
    var budget = parseFloat(e.values[5].replace(/[^0-9]/g, '')) * 1000000; // in VND (e.g., 2000 for 2 Billion)
    var downPayment = parseFloat(e.values[6].replace(/[^0-9]/g, '')) * 1000000; // in VND
    var loanTermYears = parseInt(e.values[7]); // e.g., 15 years
    
    // 2. Perform Installment Calculation
    var loanAmount = budget - downPayment;
    if (loanAmount < 0) loanAmount = 0;
    
    var annualInterestRate = 0.085; // Fixed 8.5% per year for prototype
    var monthlyInterestRate = annualInterestRate / 12;
    var totalMonths = loanTermYears * 12;
    
    // Monthly payment calculation using standard PMT formula:
    // PMT = P * r * (1 + r)^n / ((1 + r)^n - 1)
    var monthlyPayment = 0;
    if (loanAmount > 0 && monthlyInterestRate > 0) {
      monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                       (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    }
    
    // 3. Find Matching Properties from "Properties" Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Properties");
    var matchingProperties = [];
    
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      // Look for matches under budget and matching the project
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var propId = row[0];
        var propProject = row[1];
        var propType = row[2];
        var propPrice = parseFloat(row[3]); // in VND
        var propArea = row[4];
        var propDirection = row[5];
        
        if (propProject === project && propPrice <= budget) {
          matchingProperties.push({
            id: propId,
            project: propProject,
            type: propType,
            price: propPrice,
            area: propArea,
            direction: propDirection
          });
        }
        if (matchingProperties.length >= 3) break; // Limit to top 3 matches
      }
    } else {
      // Fallback Mock Data if sheet doesn't exist
      matchingProperties = [
        { id: "OP1-S01", project: project, type: "Studio", price: budget * 0.9, area: "32m²", direction: "Đông Nam" },
        { id: "OP1-1N02", project: project, type: "1PN+", price: budget * 0.95, area: "48m²", direction: "Tây Nam" }
      ];
    }
    
    // 4. Construct beautiful HTML Email
    var emailSubject = "🏠 Báo Giá Căn Hộ & Bảng Tính Trả Góp - HomeSeeker AI";
    var htmlBody = buildHtmlEmail(fullName, project, budget, downPayment, loanAmount, loanTermYears, monthlyPayment, matchingProperties);
    
    // 5. Send Email
    MailApp.sendEmail({
      to: email,
      subject: emailSubject,
      htmlBody: htmlBody
    });
    
    // Log Lead in another tab (Simulated CRM log)
    logLeadToSheet(fullName, phone, email, project, budget, monthlyPayment);
    
  } catch (error) {
    Logger.log("Error in onFormSubmit: " + error.toString());
  }
}

function buildHtmlEmail(name, project, budget, downPayment, loanAmount, years, monthlyPayment, properties) {
  var propRows = "";
  for (var i = 0; i < properties.length; i++) {
    var p = properties[i];
    propRows += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold; color: #1a73e8;">${p.id}</td>
        <td style="padding: 10px;">${p.type}</td>
        <td style="padding: 10px;">${p.area}</td>
        <td style="padding: 10px;">${p.direction}</td>
        <td style="padding: 10px; font-weight: bold; color: #d93025;">${(p.price / 1000000000).toFixed(2)} tỷ</td>
      </tr>
    `;
  }
  
  if (properties.length === 0) {
    propRows = `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #999;">Không có căn hộ nào phù hợp hoàn toàn với ngân sách hiện tại. Chúng tôi sẽ gửi thêm phương án khác.</td></tr>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">HOMESEEKER AI</h2>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Trợ Lý Tư Vấn Bất Động Sản Đa Kênh</p>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã quan tâm đến dự án <strong>${project}</strong>. Dựa trên nhu cầu ngân sách của bạn, chúng tôi đã tính toán phương án trả góp tối ưu và lọc ra một số quỹ căn phù hợp nhất.</p>
        
        <!-- Bảng Tính Trả Góp -->
        <div style="background-color: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1a73e8; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">📊 Tóm Tắt Phương Án Trả Góp</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td>Giá trị căn hộ dự kiến:</td><td style="text-align: right; font-weight: bold;">${(budget / 1000000000).toFixed(2)} tỷ</td></tr>
            <tr><td>Vốn tự có (Trả trước):</td><td style="text-align: right; font-weight: bold; color: #2e7d32;">${(downPayment / 1000000000).toFixed(2)} tỷ</td></tr>
            <tr><td>Khoản vay ngân hàng:</td><td style="text-align: right; font-weight: bold;">${(loanAmount / 1000000000).toFixed(2)} tỷ</td></tr>
            <tr><td>Thời hạn vay:</td><td style="text-align: right;">${years} năm</td></tr>
            <tr style="font-size: 16px; color: #d93025; font-weight: bold; border-top: 1px solid #ccc;">
              <td style="padding-top: 10px;">Trả góp hàng tháng (TB):</td>
              <td style="text-align: right; padding-top: 10px;">${(monthlyPayment / 1000000).toFixed(1)} triệu/tháng</td>
            </tr>
          </table>
        </div>

        <!-- Quỹ Căn Đề Xuất -->
        <h3 style="color: #333; border-bottom: 2px solid #2a5298; padding-bottom: 5px; margin-top: 25px;">🏠 Danh Sách Căn Hộ Đang Trống Phù Hợp</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f3f4; text-align: left; font-weight: bold;">
              <th style="padding: 10px;">Mã Căn</th>
              <th style="padding: 10px;">Loại</th>
              <th style="padding: 10px;">Diện Tích</th>
              <th style="padding: 10px;">Hướng</th>
              <th style="padding: 10px;">Giá Bán</th>
            </tr>
          </thead>
          <tbody>
            ${propRows}
          </tbody>
        </table>
        
        <p style="margin-top: 30px; text-align: center;">
          <a href="https://zalo.me/your-oa-link" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">💬 Kết Nối Với Sales Qua Zalo</a>
        </p>
      </div>
      <div style="background-color: #f1f3f4; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd;">
        Hệ thống tự động hóa thuộc dự án HA Group BĐS Thành Trung.<br>
        © 2026 HomeSeeker AI. All rights reserved.
      </div>
    </div>
  `;
}

function logLeadToSheet(name, phone, email, project, budget, monthlyPayment) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Leads");
    sheet.appendRow(["Thời gian", "Họ Tên", "Số Điện Thoại", "Email", "Dự Án", "Ngân Sách (tỷ)", "Trả Góp Dự Tính (triệu/tháng)", "Trạng Thái"]);
  }
  sheet.appendRow([
    new Date(),
    name,
    phone,
    email,
    project,
    (budget / 1000000000).toFixed(2),
    (monthlyPayment / 1000000).toFixed(1),
    "Chờ xử lý"
  ]);
}
