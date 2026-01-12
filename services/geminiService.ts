
import { GoogleGenAI } from "@google/genai";
import { Gender, TransformOptions } from "../types";

export const transformImageToProfessional = async (
  base64Image: string,
  options: TransformOptions
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract base64 data without prefix
  const base64Data = base64Image.split(',')[1];
  
  const genderContext = options.gender === Gender.MALE ? "남성" : options.gender === Gender.FEMALE ? "여성" : "사람";
  const prompt = `
    이 사진 속 ${genderContext}을 전문 취업 증명사진 스타일로 자연스럽게 보정해줘.
    
    주요 요구 사항:
    1. 배경: ${options.backgroundType === 'white' ? '깔끔한 흰색' : '부드러운 회색'} 스튜디오 배경으로 변경.
    2. 복장: 단정한 ${options.suitColor} 비즈니스 정장(수트와 셔츠/블라우스)을 입은 모습으로 합성.
    3. 조명: 전문 사진 스튜디오에서 촬영한 것 같은 화사하고 고른 조명 적용.
    4. 유지: 사용자의 이목구비와 얼굴형, 정체성을 최대한 유지하면서 신뢰감 있는 인상으로 개선.
    5. 품질: 고해상도의 선명한 인물 사진으로 생성.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let transformedUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        transformedUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!transformedUrl) {
      throw new Error("이미지 생성에 실패했습니다.");
    }

    return transformedUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
