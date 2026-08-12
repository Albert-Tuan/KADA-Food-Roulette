/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
import prisma from '../../shared/utils/prisma';
import { extractMenuItems } from '../../shared/services/ocr.service';

export interface VerifyItemInput {
  name: string;
  priceVND?: number;
  category?: string;
  tags?: string[];
}

export interface MenuItemParsed {
  name: string;
  priceVND?: number;
  category?: string;
  tags?: string[];
}

export class MenuService {
  async createMenu(restaurantId: string, capturedBy: string, imagePaths: string[]): Promise<Record<string, unknown>> {
    const primaryImageUrl = imagePaths.length > 0 ? imagePaths[0] : '';
    
    // Process OCR on all images using Gemini
    const finalItems = (await extractMenuItems(imagePaths)) as unknown as MenuItemParsed[];
    
    // Calculate confidence based on whether items were found
    const confidence = finalItems.length > 0 ? 0.95 : 0;
    const extractedText = JSON.stringify(finalItems);

    if (finalItems.length === 0) {
      throw new Error("AI không nhận diện được món ăn nào từ ảnh.");
    }

    const menu = await prisma.menu.create({
      data: {
        restaurantId,
        imageUrl: primaryImageUrl,
        extractedText,
        confidence,
        capturedBy,
        status: 'PENDING',
        items: {
          create: finalItems.map((item: MenuItemParsed, index: number) => ({
            name: item.name,
            priceVND: item.priceVND,
            category: item.category,
            tags: item.tags || [],
            sortOrder: index,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      menuId: menu.id,
      items: menu.items,
      confidence: menu.confidence,
      requiresVerification: true,
    };
  }

  async verifyMenu(menuId: string, items: VerifyItemInput[], userId: string) {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      throw new Error('Không tìm thấy menu');
    }

    if (menu.capturedBy !== userId) {
      throw new Error('Bạn không có quyền xác nhận menu này');
    }

    await prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({
        where: { menuId },
      });

      await tx.menuItem.createMany({
        data: items.map((item, index) => ({
          menuId,
          name: item.name,
          priceVND: item.priceVND,
          category: item.category,
          tags: item.tags || [],
          sortOrder: index,
        })),
      });

      await tx.menu.update({
        where: { id: menuId },
        data: { status: 'VERIFIED' },
      });
    });

    return await this.getMenuById(menuId);
  }

  async getMenuById(menuId: string) {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { items: true },
    });

    if (!menu) {
      throw new Error('Không tìm thấy menu');
    }

    return menu;
  }

  async getMenusByRestaurant(restaurantId: string) {
    const menus = await prisma.menu.findMany({
      where: {
        restaurantId,
        status: 'VERIFIED',
      },
      orderBy: {
        capturedAt: 'desc',
      },
      include: {
        items: true,
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return menus.map((menu) => ({
      ...menu,
      isFresh: menu.capturedAt >= thirtyDaysAgo,
    }));
  }
}

export const menuService = new MenuService();
