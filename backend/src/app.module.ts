import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { WbsModule } from './wbs/wbs.module';
import { CostModule } from './cost/cost.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ProgressModule } from './progress/progress.module';
import { DocumentsModule } from './documents/documents.module';
import { RisksModule } from './risks/risks.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,      // 1 second
      limit: 10,      // 10 requests/second
    }, {
      name: 'medium',
      ttl: 60000,     // 1 minute
      limit: 100,     // 100 requests/minute
    }, {
      name: 'long',
      ttl: 3600000,   // 1 hour
      limit: 1000,    // 1000 requests/hour
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    WbsModule,
    CostModule,
    ScheduleModule,
    ProgressModule,
    DocumentsModule,
    RisksModule,
    DashboardModule,
  ],
})
export class AppModule {}
