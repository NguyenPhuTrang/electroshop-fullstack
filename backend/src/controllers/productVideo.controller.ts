import { Request, Response, NextFunction } from "express";
import { uploadProductVideo, uploadProductVideoFromUrl } from "../services/productVideo.service";

export const uploadProductVideoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.file) { // Kiểm tra video đã được lưu vào tệp chưa
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    const product = await uploadProductVideo(
      productId,
      req.file.buffer
    );

    return res.status(200).json({
      success: true,
      message: "Product video uploaded successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductVideoFromUrlController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get product ID from URL
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Get video URL from request body
    const videoUrl = req.body?.videoUrl;

    if (typeof videoUrl !== "string" || !videoUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    // 3. Validate URL format
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(videoUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid video URL",
      });
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid HTTP or HTTPS video URL is required",
      });
    }

    // 4. Upload video from URL and save it
    const product = await uploadProductVideoFromUrl(
      productId,
      videoUrl.trim()
    );

    // 5. Return result
    return res.status(200).json({
      success: true,
      message: "Product video uploaded successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};