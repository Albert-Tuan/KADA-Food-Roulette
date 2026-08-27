import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as Location from 'expo-location';
import { restaurantApi, Restaurant, placesApi } from '@/api';

import { MapView, Marker, PROVIDER_GOOGLE, UrlTile } from '@/components/MapProvider';
import { WebView } from 'react-native-webview';
import MapFilterSheet from '@/components/MapFilterSheet';
import RestaurantList from '@/components/RestaurantList';

// Color scheme per brand/brand.md
// Region type for map
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const PIN_COLORS = {
  green: '#10B981', // 4.5+ stars
  golden: '#C68E17', // 3.5-4.4
  red: '#EF4444', // <3.5
};

const pinColor = (rating: number) => {
  if (rating >= 4.5) return PIN_COLORS.green;
  if (rating >= 3.5) return PIN_COLORS.golden;
  return PIN_COLORS.red;
};

interface FilterChip {
  label: string;
  value: 'all' | 'nearby' | 'top_rated' | 'new';
}

const FILTERS: FilterChip[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Gần tôi', value: 'nearby' },
  { label: 'Top rated', value: 'top_rated' },
  { label: 'Mới', value: 'new' },
];

const INITIAL_REGION: Region = {
  latitude: 10.8465, // Man Thiện, Quận 9
  longitude: 106.7938,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function DiscoverScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterChip['value']>('all');
  const [seeding, setSeeding] = useState(false);
  const [showList, setShowList] = useState(Platform.OS === 'web');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadRestaurants();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const userRegion: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(userRegion);
        mapRef.current?.animateToRegion(userRegion, 500);
      }
    } catch {
      // Use default region
    }
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      let data = await restaurantApi.list({ status: 'APPROVED' });
      
      // Mới: Định vị bằng địa chỉ và tên quán thay vì dùng kinh độ vĩ độ cố định từ DB
      const geocodedData = await Promise.all(data.map(async (r) => {
        try {
          // Thử tìm theo tên quán + địa chỉ
          const geocodeName = await Location.geocodeAsync(`${r.name}, ${r.address}`);
          if (geocodeName && geocodeName.length > 0) {
            return { ...r, lat: geocodeName[0].latitude, lng: geocodeName[0].longitude };
          }
          // Thử tìm theo địa chỉ
          const geocodeAddr = await Location.geocodeAsync(r.address || '');
          if (geocodeAddr && geocodeAddr.length > 0) {
            return { ...r, lat: geocodeAddr[0].latitude, lng: geocodeAddr[0].longitude };
          }
        } catch(e) {
          console.error('[Fallback] Geocode failed for', r.name, e);
        }
        return r; // Fallback dùng DB nếu không tìm thấy
      }));

      setRestaurants(geocodedData);
    } catch (error) {
      console.error('Load restaurants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedGooglePlaces = async () => {
    setSeeding(true);
    try {
      const result = await placesApi.seedNearby(region.latitude, region.longitude, 4);
      alert(
        `Đã quét quán thực tế quanh khu vực!\n✨ Thêm mới: ${result.added} quán\n⏩ Đã có: ${result.skipped} quán`
      );
      await loadRestaurants();
    } catch (error: any) {
      alert('Lỗi quét quán: ' + (error?.message || 'Vui lòng thử lại'));
    } finally {
      setSeeding(false);
    }
  };

  const openExternalMaps = (r: Restaurant) => {
    if (!r.lat || !r.lng) return;
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}?q=${r.lat},${r.lng}`,
      android: `${scheme}${r.lat},${r.lng}?q=${r.lat},${r.lng}(${r.name})`,
    });
    if (url) Linking.openURL(url);
  };

  const filtered = restaurants
    .filter((r) => {
      if (filter === 'nearby') return r.distance !== undefined && r.distance <= 5;
      if (filter === 'top_rated') return r.ratingAvg && r.ratingAvg >= 4.5;
      if (filter === 'new') {
        const oneWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return new Date(r.createdAt).getTime() > oneWeek;
      }
      return true;
    })
    .sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));

  const selected = restaurants.find((r) => r.id === selectedId);

  const handleMarkerPress = (id: string) => {
    setSelectedId(id);
    const r = restaurants.find((r) => r.id === id);
    if (r?.lat && r?.lng) {
      setRegion((prev) => ({
        ...prev,
        latitude: r.lat!,
        longitude: r.lng!,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Unified Top Navigation Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-cream-beige border-b border-borderbrown z-10">
        {/* Back / Home Button */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white border border-borderbrown items-center justify-center shadow-sm"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          activeOpacity={0.7}
        >
          <Text className="text-espresso font-bold text-base">←</Text>
        </TouchableOpacity>

        {/* Center Title */}
        <View className="items-center">
          <Text className="text-espresso font-extrabold text-lg">
            {showList ? 'Danh sách Quán ăn' : 'Bản đồ Khám Phá'}
          </Text>
          <Text className="text-warmgray text-xs">
            {filtered.length} địa điểm
          </Text>
        </View>

        {/* Right Actions */}
        <View className="flex-row items-center gap-2">
          {/* Scan Nearby Real Places via OpenStreetMap */}
          <TouchableOpacity
            className="h-10 px-3 rounded-full bg-white border border-borderbrown flex-row items-center justify-center shadow-sm"
            onPress={handleSeedGooglePlaces}
            activeOpacity={0.7}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator size="small" color="#8e4e14" />
            ) : (
              <>
                <Text className="text-sm mr-1">📡</Text>
                <Text className="text-espresso font-bold text-xs">Quét Quán</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Toggle Map / List */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white border border-borderbrown items-center justify-center shadow-sm"
            onPress={() => setShowList(!showList)}
            activeOpacity={0.7}
          >
            <Text className="text-base">{showList ? '🗺️' : '📋'}</Text>
          </TouchableOpacity>

          {/* Add Restaurant */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-espresso border border-gold items-center justify-center shadow-sm"
            onPress={() => router.push('/discover/add-restaurant' as any)}
            activeOpacity={0.7}
          >
            <Text className="text-cream text-base font-bold">➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map or Web fallback */}
      <View className="flex-1">
        {Platform.OS === 'android' ? (
          <WebView
            style={{ flex: 1 }}
            source={{ html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                  body { padding: 0; margin: 0; background-color: #FDF5E6; }
                  html, body, #map { height: 100%; width: 100%; }
                  .leaflet-control-attribution { display: none; }
                </style>
              </head>
              <body>
                <div id="map"></div>
                <script>
                  var map = L.map('map', { zoomControl: false }).setView([${region.latitude}, ${region.longitude}], 14);
                  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                  }).addTo(map);

                  // User location
                  L.circleMarker([${region.latitude}, ${region.longitude}], {
                    color: '#4A90E2', fillColor: '#4A90E2', fillOpacity: 1, radius: 8
                  }).addTo(map);

                  // Restaurants
                  var restaurants = ${JSON.stringify(filtered.filter(r => r.lat && r.lng).map(r => ({ id: r.id, lat: r.lat, lng: r.lng, name: r.name })))};
                  var customIcon = L.divIcon({
                    html: '<div style="background-color: #C68E17; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  });

                  restaurants.forEach(function(r) {
                    var m = L.marker([r.lat, r.lng], { icon: customIcon }).addTo(map);
                    m.on('click', function() {
                      window.ReactNativeWebView.postMessage(r.id);
                    });
                  });
                </script>
              </body>
              </html>
            ` }}
            onMessage={(event: any) => {
              const id = event.nativeEvent.data;
              if (id) handleMarkerPress(id);
            }}
          />
        ) : Platform.OS === 'ios' ? (
          <MapView
            ref={mapRef}
            className="w-full h-full"
            provider={undefined}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
            mapType="mutedStandard"
          >
            {filtered.map((r, index) => {
              if (!r.lat || !r.lng) return null;
              return (
                <Marker
                  key={r.id || `marker-${index}`}
                  coordinate={{ latitude: r.lat, longitude: r.lng }}
                  title={r.name}
                  description={r.address}
                  pinColor={pinColor(r.ratingAvg ?? 0)}
                  onPress={() => handleMarkerPress(r.id)}
                />
              );
            })}
          </MapView>
        ) : (
          <View className="flex-1 bg-cream-beige items-center justify-center p-6">
            <Text className="text-espresso font-bold text-lg text-center">🗺️ Bản đồ Khám Phá Quán Ăn</Text>
            <Text className="text-warmgray text-sm mt-2 text-center">Bản đồ tương tác khả dụng tốt nhất trên ứng dụng Mobile (iOS & Android).</Text>
          </View>
        )}

        {/* Loading overlay */}
        {loading && (
          <View className="absolute inset-0 bg-black/30 items-center justify-center">
            <ActivityIndicator color="#C68E17" size="large" />
          </View>
        )}

        {/* List View Overlay */}
        <RestaurantList restaurants={filtered} visible={showList} />

        {/* Selected restaurant card */}
        {selected && (
          <View
            className="absolute bottom-28 left-4 right-4 bg-cream-beige rounded-3xl p-5 shadow-xl border-1.5 border-borderbrown"
            style={{ marginBottom: 80 }}
          >
            <TouchableOpacity
              className="absolute top-3 right-3 w-8 h-8 bg-cream-linen rounded-full items-center justify-center border border-borderbrown"
              onPress={() => setSelectedId(null)}
            >
              <Text className="text-espresso font-bold text-sm">✕</Text>
            </TouchableOpacity>

            <View className="flex-row items-start">
              <View
                className="w-2.5 rounded-full mr-3"
                style={{ backgroundColor: pinColor(selected.ratingAvg ?? 0), minHeight: 44 }}
              />
              <View className="flex-1">
                <Text className="text-espresso font-extrabold text-lg">{selected.name}</Text>
                <Text className="text-warmgray text-xs mt-0.5" numberOfLines={1}>
                  {selected.address}
                </Text>
                <View className="flex-row items-center mt-1.5 gap-2">
                  {(selected.ratingAvg ?? 0) > 0 && (
                    <View className="bg-gold-soft px-2.5 py-1 rounded-xl border border-gold-light flex-row items-center">
                      <Text className="text-gold font-bold text-xs">★</Text>
                      <Text className="text-espresso text-xs font-bold ml-1">
                        {selected.ratingAvg!.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  {!!selected.category && (
                    <Text className="text-espresso-dark font-semibold text-xs">{selected.category}</Text>
                  )}
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mt-4">
              <TouchableOpacity
                className="flex-1 bg-espresso border border-gold rounded-2xl py-3 items-center"
                onPress={() => router.push(`/restaurant/${selected.id}`)}
              >
                <Text className="text-cream font-bold text-sm">Xem Chi Tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-12 bg-gold rounded-2xl py-3 items-center justify-center"
                onPress={() => openExternalMaps(selected)}
              >
                <Text className="text-espresso text-base">📍</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom panel */}
        {!showList && (
          <View className="absolute bottom-0 left-0 right-0 bg-cream-beige rounded-t-4xl shadow-xl border-t border-borderbrown">
            {/* Handle */}
            <TouchableOpacity
              className="items-center py-3"
              onPress={() => setShowFilter(true)}
            >
              <View className="w-12 h-1.5 bg-borderbrown rounded-full" />
              <Text className="text-warmgray text-xs font-bold mt-1">Lọc Nâng Cao</Text>
            </TouchableOpacity>

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 mb-2"
              contentContainerStyle={{ gap: 8 }}
            >
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  className={`px-4 py-2 rounded-2xl border ${filter === f.value ? 'bg-espresso border-espresso' : 'bg-cream border-borderbrown'
                    }`}
                  onPress={() => setFilter(f.value)}
                >
                  <Text
                    className={`text-xs font-bold ${filter === f.value ? 'text-cream' : 'text-espresso'
                      }`}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Restaurant count */}
            <Text className="px-5 text-warmgray text-xs mb-3 font-semibold">
              Tìm thấy {filtered.length} quán ăn {filter === 'nearby' ? 'trong bán kính 5km' : ''}
            </Text>
          </View>
        )}

        {/* Filter Sheet Modal */}
        <MapFilterSheet
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          filter={filter}
          setFilter={(f: any) => setFilter(f)}
        />
      </View>
    </SafeAreaView>
  );
}