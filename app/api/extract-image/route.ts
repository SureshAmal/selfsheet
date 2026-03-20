import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    // Provide the image as a Buffer to the AI SDK rather than a URL
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        month: z.string(),
        protocols: z.array(z.string()),
        logs: z.array(
          z.object({
            protocolName: z.string(),
            day: z.number(),
            status: z.boolean(),
          })
        ),
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this habit tracker sheet. Extract the month name, the list of protocols/habits on the left, and map out which days have been checked off for each protocol. Return as JSON.'
            },
            {
              type: 'image',
              image: imageBuffer
            }
          ]
        }
      ]
    });

    return Response.json(object);
  } catch (error) {
    console.error('Error extracting image:', error);
    return Response.json({ error: 'Failed to extract data' }, { status: 500 });
  }
}
