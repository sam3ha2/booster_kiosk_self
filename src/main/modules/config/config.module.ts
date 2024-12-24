import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'

import { ConfigController } from '@main/modules/config/config.controller'
import { ConfigService } from '@main/modules/config/config.service'

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
  ],
  providers: [ConfigController, ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
