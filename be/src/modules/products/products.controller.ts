import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateAttributeDto,
  CreateAttributeValueDto,
} from './dto/create-attribute.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { QueryProductDto } from './dto/query-product.dto';
import {
  ReorderProductImagesDto,
  UpdateProductImageDto,
} from './dto/update-product-image.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('products')
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('products/id/:id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findByIdForEdit(id);
  }

  @Public()
  @Get('products/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('products')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('products/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('products/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Public()
  @Get('products/:productId/variants')
  listVariants(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.listVariants(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('products/:productId/variants')
  createVariant(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(variantId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('variants/:variantId')
  removeVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.productsService.removeVariant(variantId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('products/:productId/images')
  addImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productsService.addImage(productId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('products/:productId/images/reorder')
  reorderImages(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: ReorderProductImagesDto,
  ) {
    return this.productsService.reorderImages(productId, dto.imageIds);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('product-images/:imageId')
  updateImage(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.productsService.updateImage(imageId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('product-images/:imageId')
  removeImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.removeImage(imageId);
  }

  @Public()
  @Get('product-attributes')
  listAttributes() {
    return this.productsService.listAttributes();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('product-attributes')
  createAttribute(@Body() dto: CreateAttributeDto) {
    return this.productsService.createAttribute(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('product-attributes/:attributeId/values')
  createAttributeValue(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Body() dto: CreateAttributeValueDto,
  ) {
    return this.productsService.createAttributeValue(attributeId, dto);
  }
}
