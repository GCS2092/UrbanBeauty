import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { HairStyleRequestsService } from './hair-style-requests.service';
import { CreateHairStyleRequestDto } from './dto/create-hair-style-request.dto';

@Controller('hair-style-requests')
export class HairStyleRequestsController {
  constructor(private readonly hairStyleRequestsService: HairStyleRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createHairStyleRequestDto: CreateHairStyleRequestDto) {
    return this.hairStyleRequestsService.create(createHairStyleRequestDto);
  }
}

