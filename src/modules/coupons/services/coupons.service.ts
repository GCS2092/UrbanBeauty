import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon introuvable');
    }

    return coupon;
  }

  async findByCode(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async validateCoupon(validateCouponDto: ValidateCouponDto) {
    const coupon = await this.findByCode(validateCouponDto.code);

    if (!coupon) {
      throw new NotFoundException('Code coupon invalide');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Ce coupon n\'est plus actif');
    }

    const now = new Date();
    if (new Date(coupon.validFrom) > now) {
      throw new BadRequestException('Ce coupon n\'est pas encore valide');
    }

    if (new Date(coupon.validUntil) < now) {
      throw new BadRequestException('Ce coupon a expiré');
    }

    if (validateCouponDto.totalAmount && coupon.minPurchase) {
      if (validateCouponDto.totalAmount < coupon.minPurchase) {
        throw new BadRequestException(
          `Montant minimum d'achat requis : ${coupon.minPurchase} €`
        );
      }
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Ce coupon a atteint sa limite d\'utilisation');
    }

    // Vérifier la limite par utilisateur si userId est fourni
    if (validateCouponDto.userId && coupon.userLimit) {
      const userUsageCount = await this.prisma.order.count({
        where: {
          userId: validateCouponDto.userId,
          couponId: coupon.id,
        },
      });

      if (userUsageCount >= coupon.userLimit) {
        throw new BadRequestException('Vous avez atteint la limite d\'utilisation de ce coupon');
      }
    }

    return coupon;
  }

  async calculateDiscount(coupon: any, totalAmount: number): Promise<number> {
    let discount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discount = Math.min(coupon.discountValue, totalAmount);
    }

    return Math.round(discount * 100) / 100; // Arrondir à 2 décimales
  }

  async create(createCouponDto: CreateCouponDto) {
    // Vérifier que le code n'existe pas déjà
    const existing = await this.findByCode(createCouponDto.code);
    if (existing) {
      throw new BadRequestException('Un coupon avec ce code existe déjà');
    }

    return this.prisma.coupon.create({
      data: {
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
      },
    });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);

    // Si le code change, vérifier qu'il n'existe pas déjà
    if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== coupon.code) {
      const existing = await this.findByCode(updateCouponDto.code);
      if (existing) {
        throw new BadRequestException('Un coupon avec ce code existe déjà');
      }
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...updateCouponDto,
        ...(updateCouponDto.code && { code: updateCouponDto.code.toUpperCase() }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}

