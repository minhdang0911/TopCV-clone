import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    if (!file) throw new BadRequestException('Không có file upload');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype))
      throw new BadRequestException('Chỉ chấp nhận file ảnh (jpg, png, webp)');

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize)
      throw new BadRequestException('File không được vượt quá 5MB');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          overwrite: true,
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(new BadRequestException('Upload thất bại'));
          else resolve(result!.secure_url);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async uploadDoc(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    if (!file) throw new BadRequestException('Không có file upload');

    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
    ];
    if (!allowedMimes.includes(file.mimetype))
      throw new BadRequestException('Chỉ chấp nhận file ảnh hoặc PDF');

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize)
      throw new BadRequestException('File không được vượt quá 5MB');

    const isImage = file.mimetype.startsWith('image/');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: isImage ? 'image' : 'raw',
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(new BadRequestException('Upload thất bại'));
          else resolve(result!.secure_url);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    if (!file) throw new BadRequestException('Không có file upload');

    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimes.includes(file.mimetype))
      throw new BadRequestException('Chỉ chấp nhận file PDF, DOC, DOCX');

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize)
      throw new BadRequestException('File không được vượt quá 5MB');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: 'raw',
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(new BadRequestException('Upload thất bại'));
          else resolve(result!.secure_url);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
