import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private configured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.configured = true;
    }
  }

  isConfigured() {
    return this.configured;
  }

  private assertConfigured() {
    if (!this.configured) {
      throw new BadRequestException(
        'Profile picture upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; publicId: string }> {
    this.assertConfigured();

    const folder = process.env.CLOUDINARY_AVATAR_FOLDER ?? 'jobmatch/avatars';
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder,
          public_id: userId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }],
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult!);
        },
      );
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteImage(publicId?: string | null) {
    if (!this.configured || !publicId) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
