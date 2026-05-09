const { GoogleGenAI } = require("@google/genai");

class NewsAIService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // model chính + model dự phòng
    this.primaryModel = process.env.GEMINI_MODEL_PRIMARY || "gemini-2.5-flash";
    this.fallbackModel =
      process.env.GEMINI_MODEL_FALLBACK || "gemini-2.0-flash";
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isRetryableError(error) {
    const raw = error?.message || "";
    return (
      raw.includes('"code":503') ||
      raw.includes('"status":"UNAVAILABLE"') ||
      raw.includes("503") ||
      raw.includes("UNAVAILABLE")
    );
  }

  async generateWithRetry({ model, contents, config, maxRetries = 3 }) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents,
          config,
        });

        return response;
      } catch (error) {
        lastError = error;

        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        // exponential backoff: 1s -> 2s -> 4s ...
        const delay = 1000 * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  async generateRobust({ contents, config }) {
    try {
      return await this.generateWithRetry({
        model: this.primaryModel,
        contents,
        config,
        maxRetries: 3,
      });
    } catch (error) {
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // fallback model nếu model chính đang quá tải
      return await this.generateWithRetry({
        model: this.fallbackModel,
        contents,
        config,
        maxRetries: 2,
      });
    }
  }

  async suggestFromTitle(title) {
    const prompt = `
Bạn là biên tập viên blog chuyên nghiệp cho website tiệm hoa "Tiệm hoa nhà Cá".

Nhiệm vụ: Dựa trên tiêu đề bài viết, hãy sáng tạo nội dung chi tiết, hấp dẫn và phù hợp với lĩnh vực hoa tươi, quà tặng và nghệ thuật cắm hoa.

Tiêu đề: "${title}"

Yêu cầu đầu ra:
1. tag: 1 hashtag chính, viết liền, có dấu hoặc không dấu (vd: #HoaTuoiDep)
2. summary: Tóm tắt bài viết cực kỳ hấp dẫn, khơi gợi cảm xúc hoặc tò mò (khoảng 60-160 ký tự).
3. content: TOÀN BỘ nội dung bài viết bằng HTML.

Yêu cầu BẮT BUỘC cho phần "content":
- BÀI VIẾT PHẢI DÀI, CHI TIẾT (Tối thiểu 500-1000 từ). Hãy phân tích sâu, kể chuyện hoặc chia sẻ kiến thức thật cuốn hút. KHÔNG ĐƯỢC VIẾT NGẮN, SƠ SÀI.
- Chủ đề phải liên quan đến: hoa tươi, bó hoa, lẵng hoa, giỏ hoa, hoa sinh nhật, hoa khai trương, hoa cưới, hoa chúc mừng, ý nghĩa các loài hoa, nghệ thuật cắm hoa, cách bảo quản hoa, quà tặng tinh tế...
- Bố cục rõ ràng: Mở bài hấp dẫn -> Ít nhất 3 đoạn thân bài (mỗi đoạn có tiêu đề phụ) -> Kết luận.
- Bắt buộc phải có ít nhất 3 tiêu đề phụ dùng thẻ <h2>.
- Bắt buộc phải có ít nhất 1 danh sách dùng thẻ <ul> và <li> (vd: các điểm nhấn, phân loại, ý nghĩa, lợi ích, mẹo chăm sóc...).
- Văn phong tự nhiên, tinh tế, cảm xúc, chuyên nghiệp như một blogger về hoa và phong cách sống.
- Nội dung phải có giá trị thực tế, giàu hình ảnh, dễ khiến khách hàng muốn mua hoa hoặc tìm hiểu thêm.
- CHỈ sử dụng các thẻ HTML sau đây để trình bày (tuyệt đối không dùng <h1>, <div>, class, style, hay markdown):
<p>, <h2>, <ul>, <li>, <strong>, <em>

Viết nội dung THẬT SỰ, CHẤT LƯỢNG, không được dùng các câu văn giữ chỗ (placeholder) như "Nội dung phần 1...".
`;

    const response = await this.generateRobust({
      contents: prompt,
      config: {
        systemInstruction:
          'Bạn là chuyên gia nội dung hàng đầu cho "Tiệm hoa nhà Cá". BẠN BẮT BUỘC PHẢI VIẾT BÀI CHI TIẾT VÀ DÀI (khoảng 1000 - 1500 TỪ). Hãy phân tích mọi khía cạnh: ý nghĩa từng loại hoa, cảm xúc người nhận, dịp tặng phù hợp, cách phối màu, phong cách bó hoa, cách bảo quản, giá trị thẩm mỹ và văn hóa tặng hoa. Trình bày sâu sắc, giàu cảm xúc và không được viết sơ sài.',
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            tag: { type: "string" },
            summary: { type: "string" },
            content: {
              type: "string",
              description:
                "Toàn bộ bài viết HTML định dạng bằng thẻ p, h2, ul, li, strong, em. Phải viết bài dài, trên 1000 từ.",
            },
          },
          required: ["tag", "summary", "content"],
        },
      },
    });

    return JSON.parse(response.text);
  }

  async suggestContentFromSummary(title, summary) {
    const prompt = `
Bạn là biên tập viên blog chuyên nghiệp cho website tiệm hoa "Tiệm hoa nhà Cá".

Nhiệm vụ: Viết MỘT BÀI VIẾT HOÀN CHỈNH, RẤT CHI TIẾT dựa trên Tiêu đề và Tóm tắt sau:

Tiêu đề: "${title}"
Tóm tắt: "${summary}"

Yêu cầu BẮT BUỘC cho nội dung bài viết (content):
- ĐỘ DÀI: Bài viết phải thật dài và chi tiết (tối thiểu 400 - 600 từ). KHÔNG ĐƯỢC làm ngắn, sơ sài.
- Nội dung phải xoay quanh lĩnh vực: hoa tươi, nghệ thuật tặng hoa, ý nghĩa hoa, xu hướng bó hoa, lẵng hoa, hoa sự kiện, hoa sinh nhật, hoa chúc mừng, hoa tình yêu, hoa cưới, cách chọn hoa theo dịp và cách chăm sóc hoa.
- Hãy mở rộng và phát triển ý từ phần tóm tắt, đưa ra lập luận, ví dụ, cảm xúc, hình ảnh gợi tả và giá trị thực tế cho người đọc.
- Mở bài: Dẫn dắt lôi cuốn, tạo cảm xúc hoặc khơi gợi nhu cầu tặng hoa.
- Thân bài: Phải có ít nhất 3 tiêu đề phụ (dùng thẻ <h2>). Dưới mỗi tiêu đề phụ là các đoạn văn phân tích chi tiết.
- Danh sách: Có ít nhất 1 danh sách dạng bullet (dùng thẻ <ul> và <li>) để làm nổi bật các ý chính, đặc điểm, hoặc hướng dẫn.
- Kết luận: Chốt lại vấn đề và để lại thông điệp ấn tượng, nhẹ nhàng và tinh tế cho người đọc.
- Văn phong: Mang tính chuyên gia, tinh tế, giàu cảm xúc, thẩm mỹ và hấp dẫn khách hàng.
- ĐỊNH DẠNG HOÀN TOÀN BẰNG HTML. Chỉ được phép sử dụng các thẻ sau (không dùng markdown, thiếu thẻ, cấu trúc sai):
<p>, <h2>, <ul>, <li>, <strong>, <em>

Hãy viết nội dung THẬT, chất lượng cao, từ ngữ phong phú, không lặp lại y hệt phần gợi ý. KHÔNG viết các phần giữ chỗ kiểu "Nội dung chính rơi vào đây...".
`;

    const response = await this.generateRobust({
      contents: prompt,
      config: {
        systemInstruction:
          'Bạn là chuyên gia nội dung về hoa và quà tặng cao cấp cho "Tiệm hoa nhà Cá". CHÚ Ý QUAN TRỌNG: Bạn BẮT BUỘC phải viết bài chi tiết, độ dài khoảng 1000 đến 1500 từ. Hãy đi sâu vào ý nghĩa hoa, tâm lý người tặng và người nhận, nghệ thuật phối hoa, vẻ đẹp thị giác, thông điệp cảm xúc, xu hướng hoa hiện đại và giá trị tinh thần mà một bó hoa mang lại. Mỗi phần phải thật chi tiết, cuốn hút và có chiều sâu.',
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description:
                "Toàn bộ bài viết HTML định dạng bằng thẻ p, h2, ul, li, strong, em. BẮT BUỘC PHẢI DÀI HƠN 1000 TỪ.",
            },
          },
          required: ["content"],
        },
      },
    });

    return JSON.parse(response.text);
  }
}

module.exports = new NewsAIService();