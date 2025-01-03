import { Module } from '@nestjs/common'

import { BayModule } from '@main/modules/bay/bay.module'
import { ConfigModule } from '@main/modules/config/config.module'
import { DeveloperModule } from '@main/modules/developer/developer.module'
import { ElectronModule } from '@main/modules/electron/electron.module'
import { MigrationModule } from '@main/modules/migration/migration.module'
import { UpdateModule } from '@main/modules/update/update.module'

@Module({
  imports: [
    ConfigModule,
    MigrationModule.forRootAsync(),
    ElectronModule,
    UpdateModule,
    DeveloperModule,
    BayModule,
  ],
})
export class AppModule {}
