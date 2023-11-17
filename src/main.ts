import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { protobufPackage } from './proto/user/user';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC, 
    options: {
      url: '0.0.0.0:50051',
      protoPath: join(__dirname, '../src/proto/user/user.proto'),
      package: protobufPackage
  }});

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
