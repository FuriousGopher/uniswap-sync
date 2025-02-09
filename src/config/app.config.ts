import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export const configureApp = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  return {
    port: configService.get<number>('PORT') || 3000,
  };
};
