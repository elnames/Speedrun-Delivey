import {
  Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReviewDto } from '../users/dto/users.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Get('user/:id')
  getForUser(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getForUser(id);
  }

  @Get()
  @Roles('ADMIN')
  getAll() {
    return this.reviewsService.getAll();
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.delete(id);
  }
}
