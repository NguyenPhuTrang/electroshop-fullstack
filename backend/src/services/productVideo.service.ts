import { prisma } from "../config/prisma";
import cloudinary from "../config/cloudinary";
import { AppError } from "../utils/AppError";
import {
  uploadVideo,
  uploadVideoFromUrl,
} from "./upload.service";

export const uploadProductVideo = async (
  productId: number,
  fileBuffer: Buffer
) => {
  const product = await prisma.product.findUnique({ // kiểm tra xem sản phẩm đấy có tồn tại hay không
    where: { id: productId },
    select: {
      id: true,
      videoPublicId: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const result = await uploadVideo( 
    fileBuffer,
    "electroshop/products/videos"
  );

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        videoUrl: result.secure_url,
        videoPublicId: result.public_id,
      },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        videoPublicId: true,
      },
    });

    if (product.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(
          product.videoPublicId,
          { resource_type: "video" }
        );
      } catch (error) {
        console.error("Failed to delete previous product video:", error);
      }
    }

    return updatedProduct;
  } catch (error) {
    try {
      await cloudinary.uploader.destroy(
        result.public_id,
        { resource_type: "video" }
      );
    } catch (cleanupError) {
      console.error("Failed to clean up uploaded video:", cleanupError);
    }

    throw error;
  }
};

export const uploadProductVideoFromUrl = async (
  productId: number,
  videoUrl: string
) => {
  // 1. Check whether the product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      videoPublicId: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // 2. Upload the video URL to Cloudinary
  const result = await uploadVideoFromUrl(
    videoUrl,
    "electroshop/products/videos"
  );

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        videoUrl: result.secure_url,
        videoPublicId: result.public_id,
      },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        videoPublicId: true,
      },
    });

    // 4. Delete the previous video if it exists
    if (product.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(
          product.videoPublicId,
          { resource_type: "video" }
        );
      } catch (error) {
        console.error(
          "Failed to delete previous product video:",
          error
        );
      }
    }

    return updatedProduct;
  } catch (error) {
    // Clean up the newly uploaded video if the database update fails
    try {
      await cloudinary.uploader.destroy(
        result.public_id,
        { resource_type: "video" }
      );
    } catch (cleanupError) {
      console.error(
        "Failed to clean up uploaded video:",
        cleanupError
      );
    }

    throw error;
  }
};

export const deleteProductVideo = async (productId: number) => {
  // 1. Kiểm tra sản phẩm có tồn tại hay không
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      videoUrl: true,
      videoPublicId: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // 2. Kiểm tra sản phẩm có video hay không
  if (!product.videoUrl && !product.videoPublicId) {
    throw new AppError("Product video not found", 404);
  }

  // 3. Xóa thông tin video khỏi database
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      videoUrl: null,
      videoPublicId: null,
    },
    select: {
      id: true,
      name: true,
      videoUrl: true,
      videoPublicId: true,
    },
  });

  // 4. Xóa video cũ trên Cloudinary
  if (product.videoPublicId) {
    try {
      await cloudinary.uploader.destroy(
        product.videoPublicId,
        { resource_type: "video" }
      );
    } catch (error) {
      console.error(
        "Failed to delete product video from Cloudinary:",
        error
      );
    }
  }

  return updatedProduct;
};