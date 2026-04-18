import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Res } from '@nestjs/common';
import * as express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }), // 15 MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      })
    ) file: Express.Multer.File
  ) {
    const objectName = await this.storageService.uploadFile(file);
    return { objectName };
  }

  @Get(':objectName')
  async getUrl(@Param('objectName') objectName: string, @Res() res: express.Response) {
     try {
       const stat = await this.storageService.getStat(objectName);
       const stream = await this.storageService.getObject(objectName);
       
       res.setHeader('Content-Type', stat.metaData['content-type'] || stat.metaData['Content-Type'] || 'image/png');
       stream.pipe(res);
     } catch (error) {
       res.status(404).send('File not found');
     }
  }
}
