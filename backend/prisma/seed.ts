import { PrismaClient, RestaurantSource, RestaurantStatus } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_MAN_THIEN_RESTAURANTS = [
  {
    name: 'Bún Bò Huế Ngọc Dung',
    address: '143 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8468,
    lng: 106.7942,
    phone: '0901234567',
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.6,
    category: 'Bún Bò',
    priceLevel: 2,
  },
  {
    name: 'Lẩu Bò Nghĩa Phát',
    address: '200 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8459,
    lng: 106.7951,
    phone: '0912345678',
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.3,
    category: 'Lẩu',
    priceLevel: 3,
  },
  {
    name: 'Bánh Tráng Nướng Dì Lan',
    address: '95 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8475,
    lng: 106.7935,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.8,
    category: 'Ăn Vặt',
    priceLevel: 1,
  },
  {
    name: 'Cơm Tấm Đêm Man Thiện',
    address: '250 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8451,
    lng: 106.7960,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.1,
    category: 'Cơm Tấm',
    priceLevel: 2,
  },
  {
    name: 'Trà Sữa Mixue Man Thiện',
    address: '120 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8471,
    lng: 106.7939,
    phone: '0987654321',
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.5,
    category: 'Trà Sữa',
    priceLevel: 1,
  },
  {
    name: 'Gà Rán Jollibee',
    address: '190 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8460,
    lng: 106.7949,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.2,
    category: 'Fast Food',
    priceLevel: 2,
  },
  {
    name: 'Phở Bắc Hải',
    address: '30 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8485,
    lng: 106.7920,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.4,
    category: 'Phở',
    priceLevel: 2,
  },
  {
    name: 'Ốc Đêm Sinh Viên',
    address: 'Hẻm 140 Man Thiện, Tăng Nhơn Phú A, Quận 9',
    lat: 10.8469,
    lng: 106.7945,
    source: RestaurantSource.USER_SUBMITTED,
    status: RestaurantStatus.APPROVED,
    rating: 4.7,
    category: 'Hải Sản',
    priceLevel: 2,
  },
  {
    name: 'Bún Đậu Mắm Tôm A Chảnh',
    address: '165 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8464,
    lng: 106.7947,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.0,
    category: 'Bún Đậu',
    priceLevel: 2,
  },
  {
    name: 'Mì Cay Sasin Man Thiện',
    address: '88 Man Thiện, Tăng Nhơn Phú A, Quận 9, TP.HCM',
    lat: 10.8478,
    lng: 106.7930,
    source: RestaurantSource.GOOGLE_PLACES,
    status: RestaurantStatus.APPROVED,
    rating: 4.3,
    category: 'Mì Cay',
    priceLevel: 2,
  }
];

async function main() {
  console.log('Seeding restaurants...');
  
  for (const restaurant of MOCK_MAN_THIEN_RESTAURANTS) {
    await prisma.restaurant.create({
      data: restaurant,
    });
  }
  
  console.log('Successfully seeded 10 restaurants on Man Thien street!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
