import { GoogleGenAI, Modality } from "@google/genai";
import { Order } from './types';

// IMPORTANT: This key is automatically provided by the execution environment.
// DO NOT handle or store API keys in the code.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a shipping label image using Imagen 3.
 * @param order The order details to include on the label.
 * @returns A base64 encoded string of the generated JPEG image.
 */
export const generateShippingLabelImage = async (order: Order): Promise<string> => {
  const prompt = `A professional, realistic shipping label for an e-commerce company "Siam Connect Hub". The label should be on a white background. It must clearly show the following details: 
- To: ${order.customerName}
- Order ID: ${order.externalOrderId}
- Tracking #: ${order.trackingNumber}
- From: Siam Connect Hub Fulfillment Center, Bangkok, Thailand
- Include a scannable, generic barcode and a QR code. The style should be clean, modern, and professional.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("Image generation failed, no images returned.");
    }
  } catch (error) {
    console.error("Error generating shipping label:", error);
    // Return a placeholder image on failure
    return "https://placehold.co/600x450/d1d5db/4b5563?text=Error+Generating+Label";
  }
};

/**
 * Generates a friendly LINE notification message for the customer.
 * @param order The order for which to generate the notification.
 * @returns A string containing the notification text.
 */
export const generateLineNotificationText = async (order: Order): Promise<string> => {
  const prompt = `Write a friendly and professional notification message to be sent to a customer via the LINE app. The message should inform the customer that their order has been shipped.
- Customer Name: ${order.customerName}
- Order Number: ${order.externalOrderId}
- Shipping Carrier: SHIPPOP
- Tracking Number: ${order.trackingNumber}

The message should be in Thai. Start with a greeting and end with a thank you. Keep it concise and clear.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating LINE notification text:", error);
    return "There was an error generating the notification message.";
  }
};

/**
 * Generates a template for an abandoned cart LINE message.
 * @returns A string containing the message template.
 */
export const generateAbandonedCartTemplate = async (): Promise<string> => {
  const prompt = `Write a friendly and effective abandoned cart reminder message template for a LINE message. The language must be Thai. Include placeholders for the customer's name, a list of cart items, and the checkout link. The placeholders should be in the format {{placeholder_name}}. The tone should be helpful and slightly urgent, but not pushy. Suggest a small discount to encourage completion.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating abandoned cart template:", error);
    return "คุณ {{customer_name}} เหมือนจะลืมอะไรไว้ในตะกร้านะคะ! กลับมาสั่งซื้อให้เสร็จสิ้นเพื่อรับส่วนลดพิเศษ!";
  }
}

/**
 * Generates speech for an order summary.
 * @param order The order to summarize.
 * @returns A base64 encoded string of the generated audio.
 */
export const generateOrderSummarySpeech = async (order: Order): Promise<string> => {
  const prompt = `Please read out this order summary clearly: 
  Order ID: ${order.externalOrderId}. 
  Customer Name: ${order.customerName}. 
  Order Date: ${order.date}. 
  Current Status: ${order.status}. 
  Tracking Number: ${order.trackingNumber || 'Not available yet'}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("Audio generation failed, no audio returned.");
    }
  } catch (error) {
    console.error("Error generating order summary speech:", error);
    throw error;
  }
};
