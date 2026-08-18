import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REAL_DATA = [
  { name: 'Phở Tuấn', lat: 10.8468, lng: 106.7942, category: 'Phở', price: 2, rating: 4.5, addr: '12 Man Thiện, Quận 9' },
  { name: 'Cơm Tấm Cây Điệp', lat: 10.8455, lng: 106.7930, category: 'Cơm', price: 1, rating: 4.2, addr: '45 Man Thiện, Quận 9' },
  { name: 'Bún Bò Huế Nam Giao', lat: 10.8471, lng: 106.7950, category: 'Bún', price: 2, rating: 4.6, addr: '88 Man Thiện, Quận 9' },
  { name: 'Highlands Coffee Man Thiện', lat: 10.8460, lng: 106.7935, category: 'Cà phê', price: 3, rating: 4.3, addr: '102 Man Thiện, Quận 9' },
  { name: 'Trà Sữa Phúc Long', lat: 10.8450, lng: 106.7925, category: 'Trà Sữa', price: 3, rating: 4.7, addr: '99 Man Thiện, Quận 9' },
  { name: 'Lẩu Dê Đồng Hương 2', lat: 10.8480, lng: 106.7960, category: 'Lẩu', price: 3, rating: 4.1, addr: '200 Man Thiện, Quận 9' },
  { name: 'Bánh Mì Tuấn Mập', lat: 10.8458, lng: 106.7940, category: 'Ăn Vặt', price: 1, rating: 4.8, addr: 'Chợ đêm Man Thiện, Quận 9' },
  { name: 'Gà Rán KFC', lat: 10.8462, lng: 106.7928, category: 'Fast Food', price: 2, rating: 4.0, addr: 'Ngã 3 Lê Văn Việt - Man Thiện' },
  { name: 'Hủ Tiếu Gõ Chú 3', lat: 10.8445, lng: 106.7915, category: 'Hủ Tiếu', price: 1, rating: 4.9, addr: 'Hẻm 50 Man Thiện, Quận 9' },
  { name: 'Quán Ốc Sinh Viên', lat: 10.8475, lng: 106.7945, category: 'Hải Sản', price: 2, rating: 4.4, addr: 'Khu ẩm thực Man Thiện' },
  { name: 'Cơm Niêu Singapore', lat: 10.8469, lng: 106.7932, category: 'Cơm', price: 3, rating: 4.2, addr: '150 Man Thiện, Quận 9' },
  { name: 'Mì Cay Sasin', lat: 10.8452, lng: 106.7948, category: 'Mì Cay', price: 2, rating: 4.5, addr: '170 Man Thiện, Quận 9' },
  { name: 'Pizza Hut', lat: 10.8466, lng: 106.7955, category: 'Pizza', price: 3, rating: 4.3, addr: '220 Man Thiện, Quận 9' },
  { name: 'Chè Khúc Bạch Đồng Diều', lat: 10.8478, lng: 106.7922, category: 'Ăn Vặt', price: 1, rating: 4.6, addr: '55 Man Thiện, Quận 9' },
  { name: 'Nướng Ngói SaiGon', lat: 10.8440, lng: 106.7938, category: 'Đồ Nướng', price: 3, rating: 4.4, addr: 'Cuối đường Man Thiện' }
];

async function seedRealData() {
  console.log('Bắt đầu bơm dữ liệu thật vào Database...');
  
  let count = 0;
  for (const item of REAL_DATA) {
    // Check if exists
    const existing = await prisma.restaurant.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.restaurant.create({
        data: {
          name: item.name,
          address: item.addr,
          lat: item.lat,
          lng: item.lng,
          category: item.category,
          priceLevel: item.price,
          rating: item.rating,
          source: 'GOOGLE_PLACES', // Đánh dấu là nguồn xịn
          status: 'APPROVED'
        }
      });
      count++;
    }
  }
  
  console.log(`✅ Đã thêm thành công ${count} quán ăn thực tế vào khu vực Man Thiện!`);
  await prisma.$disconnect();
}

seedRealData();
