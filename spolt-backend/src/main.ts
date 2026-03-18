import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3000;
  const prefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Escuchamos en '0.0.0.0' para que la aplicación sea accesible desde fuera de WSL (desde Windows).
  // Por defecto, a veces solo escucha en '127.0.0.1', lo que impide la conexión desde el navegador de Windows.
  await app.listen(port, '0.0.0.0');

  // Imprimimos la URL completa para que sepas exactamente qué poner en Chrome,
  // ya que al tener un API_PREFIX, la ruta raíz (/) devolverá un 404.
  console.log(`[Application] Server is running at: http://localhost:${port}/${prefix}`);
}
bootstrap();

