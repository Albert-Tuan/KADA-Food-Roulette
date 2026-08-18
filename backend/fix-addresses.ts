import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Delay function to avoid hitting API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fixAddresses() {
  console.log('🔍 Đang tìm các quán ăn thiếu địa chỉ chi tiết...');
  
  // Find all restaurants that have the default generic address
  const restaurants = await prisma.restaurant.findMany({
    where: {
      address: 'Thủ Đức, TP.HCM'
    }
  });
  
  console.log(`Phát hiện ${restaurants.length} quán cần dịch ngược toạ độ sang địa chỉ thực tế.`);
  console.log('Bắt đầu Reverse Geocoding (Dịch ngược GPS). Quá trình này có thể mất vài phút vì API giới hạn 1 request/giây để tránh bị block...');
  
  let updatedCount = 0;
  
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    if (!r.lat || !r.lng) continue;
    
    try {
      // Nominatim Reverse Geocoding API (Free, OSM)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${r.lat}&lon=${r.lng}&zoom=18&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FoodRoulette/1.0 (Student Project)'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Parse the detailed address from Nominatim
        if (data && data.address) {
          const a = data.address;
          // Build a sensible Vietnamese address format
          const parts = [];
          if (a.house_number) parts.push(a.house_number);
          if (a.road) parts.push(a.road);
          if (a.suburb || a.quarter) parts.push(a.suburb || a.quarter);
          if (a.city_district || a.district) parts.push(a.city_district || a.district);
          
          let newAddress = parts.join(', ');
          
          if (newAddress.length > 5) { // Ensure it's not empty
            await prisma.restaurant.update({
              where: { id: r.id },
              data: { address: newAddress }
            });
            console.log(`[${i+1}/${restaurants.length}] ✅ Cập nhật: ${r.name} -> ${newAddress}`);
            updatedCount++;
          } else {
            console.log(`[${i+1}/${restaurants.length}] ⚠️ Không tìm thấy đường cho: ${r.name}`);
          }
        }
      }
    } catch (err) {
      console.error(`[${i+1}/${restaurants.length}] ❌ Lỗi khi dịch toạ độ cho ${r.name}:`, err);
    }
    
    // Crucial: wait 1 second between requests to respect Nominatim usage policy
    await delay(1200);
  }
  
  console.log(`\n🎉 Hoàn tất! Đã cập nhật địa chỉ chính xác cho ${updatedCount} quán ăn.`);
  await prisma.$disconnect();
}

fixAddresses();
