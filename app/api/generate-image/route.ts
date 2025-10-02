import { NextResponse } from "next/server";
import OpenAI from 'openai';

import { logger } from "@/utils/logger";

const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY as string,
});

export async function POST(request: Request) {

    try {

        const {
            prompt,
            model,
            width,
            height,
            num_inference_steps,
            negative_prompt
        } = await request.json();

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (width % 64 !== 0 || height % 64 !== 0) {
            return NextResponse.json(
                { error: 'Width and height must be multiples of 64' },
                { status: 400 }
            );
        }

        const validWidth = Math.max(256, Math.min(2048, parseInt(width) || 1024));
        const validHeight = Math.max(256, Math.min(2048, parseInt(height) || 1024));
        const validSteps = Math.max(1, Math.min(64, parseInt(num_inference_steps) || 16));

        const response = await client.images.generate({
            "model": model || "black-forest-labs/flux-schnell",
            "response_format": "b64_json",
            "response_extension": "png",
            "width": validWidth,
            "height": validHeight,
            "num_inference_steps": validSteps,
            "negative_prompt": negative_prompt || "",
            "seed": -1,
            "loras": null,
            "prompt": prompt
        } as any);

        if (response.data && response.data.length > 0) {

            const imageData = response.data[0];
            const base64Image = imageData.b64_json;

            const dataUrl = `data:image/png;base64,${base64Image}`;

            return NextResponse.json({
                success: true,
                imageUrl: dataUrl,
                imageData: base64Image,
                prompt,
                model,
                width: validWidth,
                height: validHeight,
                num_inference_steps: validSteps,
                negative_prompt,
                timestamp: new Date().toISOString()
            });

        } else {
            return NextResponse.json(
                { message: 'No image data received from API' },
                { status: 500 }
            );
        }

    } catch (error) {

        logger("Execution Error, On /api/generate-image :", error);

        return NextResponse.json(
            { message: "Oops! Something went wrong on our end. Please try again later or contact support if the issue persists." },
            { status: 500 }
        )

    }

}