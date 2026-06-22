import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { AiConnectionModule } from './ai-connection/ai-connection.module';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './jobs/jobs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { TrainingModule } from './training/training.module';
import { EmployerModule } from './employer/employer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    JobsModule,
    ApplicationsModule,
    AiConnectionModule,
    NotificationsModule,
    ChatModule,
    AdminModule,
    TrainingModule,
    EmployerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
