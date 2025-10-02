"use client";

import React, { useState } from "react";

import { useFormik } from "formik";
import { toast } from "sonner";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from "@/components/ui/slider"
import { Textarea } from '@/components/ui/textarea';

import { POST } from '@/utilities/requests/post';

import {
    ImageIcon,
    Wand2,
    Settings,
    Cpu,
    Loader2,
    Download
} from 'lucide-react';

function inferDefaultNumInferenceSteps(model: string) {
    if (model === "black-forest-labs/flux-schnell") {
        return { min: 1, max: 16, defaultValue: 4 };
    }
    if (model === "black-forest-labs/flux-dev") {
        return { min: 1, max: 64, defaultValue: 28 };
    }
    if (model === "stability-ai/sdxl") {
        return { min: 1, max: 64, defaultValue: 30 };
    }
    return { min: 1, max: 64, defaultValue: 20 };
}

const Page = () => {

    const defaultModel = 'black-forest-labs/flux-schnell';
    const defaultStepsMeta = inferDefaultNumInferenceSteps(defaultModel);

    const [stepMeta, setStepMeta] = useState(defaultStepsMeta);

    const [generatedImage, setGeneratedImage] = useState<null | {
        url: string;
        prompt: string;
        imageData?: string;
        timestamp?: string | number;
    }>(null);

    const formik = useFormik({

        initialValues: {
            prompt: '',
            model: defaultModel,
            width: 1024,
            height: 1024,
            num_inference_steps: defaultStepsMeta.defaultValue,
            negative_prompt: ''
        },

        validateOnChange: false,
        validateOnBlur: false,

        onSubmit: async (values, { setSubmitting }) => {

            setSubmitting(true);

            await formik.validateForm();
            if (!formik.isValid) {
                toast.error("Try entering some real values");
                setSubmitting(false);
                return;
            }

            try {

                const response = await POST(
                    "/api/generate-image",
                    values,
                    {},
                    {
                        loading: "Generating image ...",
                        success: "Image generated successfully!",
                        error: "Failed to generate image. Please try again."
                    }
                );

                const result = await response?.unwrap?.()
                if (result?.data) {
                    setGeneratedImage({
                        url: result.data.imageUrl,
                        prompt: values.prompt,
                        imageData: result.data.imageData,
                        timestamp: result.data.timestamp || Date.now()
                    });
                }

            } catch (error) { toast.error("An error occurred during image generation") }

            finally { setSubmitting(false) }

        }

    });

    const resetForm = () => {
        formik.resetForm();
        setGeneratedImage(null);
    };

    const handleModelChange = (value: string) => {
        const newMeta = inferDefaultNumInferenceSteps(value);
        setStepMeta(newMeta);
        formik.setFieldValue("model", value);
        formik.setFieldValue("num_inference_steps", newMeta.defaultValue);
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wand2 className="h-5 w-5" />
                                    Generate Image
                                </CardTitle>
                                <CardDescription>
                                    Fill in the details below to create your AI-generated image
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={formik.handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="prompt" className="text-sm font-medium">
                                            Prompt <Badge variant="secondary">Required</Badge>
                                        </Label>
                                        <Textarea
                                            id="prompt"
                                            name="prompt"
                                            placeholder="A futuristic cityscape at sunset with flying cars and neon lights..."
                                            value={formik.values.prompt}
                                            onChange={formik.handleChange}
                                            className="min-h-[100px] resize-none"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Describe in detail what you want to see in your image
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="model" className="text-sm font-medium flex items-center gap-2">
                                            <Cpu className="h-4 w-4" />
                                            AI Model <Badge variant="secondary">Required</Badge>
                                        </Label>
                                        <Select
                                            value={formik.values.model}
                                            onValueChange={handleModelChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="stability-ai/sdxl">Stability AI SDXL</SelectItem>
                                                <SelectItem value="black-forest-labs/flux-dev">Black Forest Labs FLUX Dev</SelectItem>
                                                <SelectItem value="black-forest-labs/flux-schnell">Black Forest Labs FLUX Schnell</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="negative_prompt" className="text-sm font-medium">
                                            Negative Prompt <Badge variant="outline">Optional</Badge>
                                        </Label>
                                        <Textarea
                                            id="negative_prompt"
                                            name="negative_prompt"
                                            placeholder="blurry, low quality, distorted, text, watermark..."
                                            value={formik.values.negative_prompt}
                                            onChange={formik.handleChange}
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            <Label className="text-sm font-medium">Generation Settings</Label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="width">Width</Label>
                                                <Input
                                                    id="width"
                                                    name="width"
                                                    type="number"
                                                    min={256}
                                                    max={2048}
                                                    step={64}
                                                    value={formik.values.width}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="height">Height</Label>
                                                <Input
                                                    id="height"
                                                    name="height"
                                                    type="number"
                                                    min={256}
                                                    max={2048}
                                                    step={64}
                                                    value={formik.values.height}
                                                    onChange={formik.handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="steps">
                                                Inference Steps
                                                <Badge variant="outline" className="ml-2">
                                                    {formik.values.num_inference_steps}
                                                </Badge>
                                            </Label>
                                            <Slider
                                                min={stepMeta.min}
                                                max={stepMeta.max}
                                                step={1}
                                                value={[formik.values.num_inference_steps || 1]}
                                                onValueChange={(value) => formik.setFieldValue("num_inference_steps", value[0])}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={formik.isSubmitting || formik.values.prompt.trim().length < 5}
                                            className="flex-1 cursor-pointer"
                                        >
                                            {formik.isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin " />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    Generate Image
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetForm}
                                            disabled={formik.isSubmitting}
                                            className="cursor-pointer"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Preview
                                </CardTitle>
                                <CardDescription>
                                    Your generated image will appear here
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                                    {formik.isSubmitting ? (
                                        <div className="text-center space-y-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                                            <p className="text-sm font-medium">Generating your image...</p>
                                        </div>
                                    ) : generatedImage ? (
                                        <div className="relative w-full h-full group">
                                            <img
                                                src={generatedImage.url}
                                                alt="Generated"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <a
                                                href={generatedImage.url}
                                                download={`generated-image-${generatedImage.timestamp || Date.now()}.png`}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 rounded-lg"
                                            >
                                                <span className="bg-white text-black flex justify-center items-center text-sm px-4 py-2 rounded shadow hover:bg-gray-100">
                                                    <Download className="h-4 w-4 mr-2" /> Download
                                                </span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                                            <p className="text-sm text-muted-foreground">No image generated yet</p>
                                        </div>
                                    )}
                                </div>

                                {generatedImage && !formik.isSubmitting && (
                                    <div className="mt-4 space-y-3">
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm font-medium mb-1">Prompt:</p>
                                            <p className="text-xs text-muted-foreground">{generatedImage.prompt}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Page;