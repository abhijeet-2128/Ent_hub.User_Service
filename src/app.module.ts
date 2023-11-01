import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { UserModule } from './users/user.module';


@Module({
  imports: [
    // MongooseModule.forRoot('mongodb+srv://abhijeetsrivastava:abhijeet2128@cluster0.6mk5ny2.mongodb.net/sample_mflix'),
    MongooseModule.forRoot('mongodb://localhost:27017/nest_db'),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
