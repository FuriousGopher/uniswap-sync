import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './config/app.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port } = configureApp(app);

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Server is running at: http://localhost:${port}`);
}
void bootstrap();
