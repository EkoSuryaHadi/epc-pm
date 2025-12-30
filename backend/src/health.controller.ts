import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            env: process.env.NODE_ENV || 'unknown'
        };
    }
}
