import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REAL_RESTAURANTS = [
  {
    name: "Phở Giao - Lê Văn Việt",
    address: "235 Lê Văn Việt, Hiệp Phú, TP. Thủ Đức, TP.HCM",
    lat: 10.8465,
    lng: 106.7932,
    category: "Phở",
    priceLevel: 2,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=800&q=80"
  },
  {
    name: "Cơm Tấm Ba Ghiền - Vincom Q9",
    address: "50 Lê Văn Việt, Hiệp Phú, TP. Thủ Đức, TP.HCM",
    lat: 10.8488,
    lng: 106.7758,
    category: "Cơm Tấm",
    priceLevel: 1,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1581514467005-4f404edc0082?w=800&q=80"
  },
  {
    name: "Bún Bò Huế 3A3",
    address: "15 Man Thiện, Hiệp Phú, TP. Thủ Đức, TP.HCM",
    lat: 10.8451,
    lng: 106.7885,
    category: "Bún Bò",
    priceLevel: 2,
    rating: 4.2,
    imageUrl: "https://images.unsplash.com/photo-1596649283311-66779b7b901a?w=800&q=80"
  },
  {
    name: "Katinat Saigon Kafe",
    address: "Ngã tư Lê Văn Việt - Đình Phong Phú, TP. Thủ Đức",
    lat: 10.8468,
    lng: 106.7869,
    category: "Cafe",
    priceLevel: 3,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
  },
  {
    name: "Highlands Coffee - Vincom Plaza",
    address: "Vincom Plaza Lê Văn Việt, 50 Lê Văn Việt",
    lat: 10.8485,
    lng: 106.7760,
    category: "Cafe",
    priceLevel: 3,
    rating: 4.1,
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80"
  },
  {
    name: "Gogi House - Nướng Hàn Quốc",
    address: "Vincom Plaza Lê Văn Việt, TP. Thủ Đức",
    lat: 10.8486,
    lng: 106.7761,
    category: "Nướng",
    priceLevel: 4,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80"
  },
  {
    name: "Lẩu Phan - Buffet Lẩu bò úc",
    address: "Làng Đại Học, TP. Thủ Đức",
    lat: 10.8702,
    lng: 106.8028,
    category: "Lẩu",
    priceLevel: 3,
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80"
  },
  {
    name: "Bánh Mì Huỳnh Hoa (Chi nhánh Thủ Đức)",
    address: "Đỗ Xuân Hợp, Phước Long B, TP. Thủ Đức",
    lat: 10.8228,
    lng: 106.7735,
    category: "Bánh Mì",
    priceLevel: 2,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1633511130906-8d80f83dd717?w=800&q=80"
  },
  {
    name: "Hủ Tiếu Nam Vang Thành Đạt",
    address: "32 Đình Phong Phú, Tăng Nhơn Phú B, TP. Thủ Đức",
    lat: 10.8422,
    lng: 106.7820,
    category: "Hủ Tiếu",
    priceLevel: 2,
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1626804475297-41609ae065c7?w=800&q=80"
  },
  {
    name: "Sushi Tei - Vincom Q9",
    address: "Tầng 4 Vincom Lê Văn Việt",
    lat: 10.8488,
    lng: 106.7758,
    category: "Sushi",
    priceLevel: 4,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80"
  }
];

async function seed() {
  console.log("🔥 Bắt đầu Seed dữ liệu Quán ăn thực tế (ShopeeFood/Foody mockup)...");
  
  let added = 0;
  
  for (const r of REAL_RESTAURANTS) {
    // Check if already exists
    const exists = await prisma.restaurant.findFirst({
      where: { name: r.name, lat: r.lat, lng: r.lng }
    });
    
    if (!exists) {
      const newRest = await prisma.restaurant.create({
        data: {
          name: r.name,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          category: r.category,
          priceLevel: r.priceLevel,
          rating: r.rating,
          source: 'USER_SUBMITTED',
          status: 'APPROVED',
          photos: {
            create: [
              {
                photoUrl: r.imageUrl
              }
            ]
          }
        }
      });
      console.log(`✅ Đã thêm: ${r.name}`);
      added++;
    } else {
      console.log(`⏩ Bỏ qua (Đã tồn tại): ${r.name}`);
    }
  }
  
  console.log(`\n🎉 Hoàn tất! Đã thêm thành công ${added} quán ăn thực tế vào cơ sở dữ liệu.`);
}

seed()
  .catch(e => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
