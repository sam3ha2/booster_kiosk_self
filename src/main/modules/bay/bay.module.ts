import { Module } from '@nestjs/common'

import { BayController } from '@main/modules/bay/bay.controller'
import { BayService } from '@main/modules/bay/bay.service'
import { GpassBayControlRepository } from '@main/modules/bay/repositories/gpass-bay-control.repository'
import { GpassApiService } from '@main/modules/bay/services/gpass_api_service'
import { ConfigModule } from '@main/modules/config/config.module'

@Module({
  imports: [ConfigModule],
  providers: [
    GpassApiService,
    BayController,
    BayService,
    {
      provide: 'IBayControlRepository',
      useClass: GpassBayControlRepository,
    },
    {
      provide: 'GPASS_API_URL',
      useValue: process.env.GPASS_API_URL,
    },
  ],
  exports: [BayService],
})
export class BayModule {}
