import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LAT = 10.845;
const LNG = 106.794;
const RADIUS_METERS = 10000; // 10km

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=800&q=80",
  "https://images.unsplash.com/photo-1581514467005-4f404edc0082?w=800&q=80",
  "https://images.unsplash.com/photo-1596649283311-66779b7b901a?w=800&q=80",
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
  "https://images.unsplash.com/photo-1633511130906-8d80f83dd717?w=800&q=80",
  "https://images.unsplash.com/photo-1626804475297-41609ae065c7?w=800&q=80",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80"
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRating(): number {
  return parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1));
}

function getRandomPrice(): number {
  return Math.floor(Math.random() * 4) + 1; // 1 to 4
}

async function fetchFromOverpass() {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|cafe|fast_food|food_court|ice_cream|bar|pub"](around:${RADIUS_METERS},${LAT},${LNG});
    );
    out body;
    >;
    out skel qt;
  `;
  
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  console.log(`Đang cào dữ liệu từ OpenStreetMap với bán kính ${RADIUS_METERS/1000}km quanh Man Thiện...`);
  console.log("Vui lòng đợi vài giây (Overpass API có thể hơi chậm)...");
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FoodRoulette/1.0',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Overpass API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.elements;
}

async function seedMassive() {
  try {
    const elements = await fetchFromOverpass();
    
    // Filter nodes with names
    const nodes = elements.filter((e: any) => e.type === 'node' && e.tags && e.tags.name);
    console.log(`📡 Lấy được tổng cộng ${nodes.length} địa điểm (có tên) từ OSM!`);
    
    const BATCH_SIZE = 100;
    let added = 0;
    
    for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
      const batch = nodes.slice(i, i + BATCH_SIZE);
      
      const insertPromises = batch.map(async (node: any) => {
        const name = node.tags.name;
        const lat = node.lat;
        const lng = node.lon;
        const category = node.tags.cuisine || node.tags.amenity || 'Food';
        const address = `${node.tags['addr:housenumber'] || ''} ${node.tags['addr:street'] || ''}`.trim() || 'Thủ Đức, TP.HCM';
        
        // Skip if exists
        const exists = await prisma.restaurant.findFirst({
          where: { name, lat, lng }
        });
        
        if (!exists) {
          await prisma.restaurant.create({
            data: {
              name,
              address,
              lat,
              lng,
              category: category.substring(0, 50),
              priceLevel: getRandomPrice(),
              rating: getRandomRating(),
              source: 'USER_SUBMITTED',
              status: 'APPROVED',
              photos: {
                create: [
                  { photoUrl: getRandom(FOOD_IMAGES) }
                ]
              }
            }
          });
          added++;
        }
      });
      
      await Promise.all(insertPromises);
      console.log(`⏳ Đã xử lý ${Math.min(i + BATCH_SIZE, nodes.length)} / ${nodes.length}...`);
    }
    
    console.log(`\n🎉 HOÀN TẤT! Đã cấy thành công ${added} quán ăn/cafe quanh khu vực của bạn.`);
    
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedMassive();
