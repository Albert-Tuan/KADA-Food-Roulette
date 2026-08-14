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
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { restaurantApi, Restaurant, placesApi } from '@/api';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  } catch (e) {
    // react-native-maps fallback
  }
}

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
  latitude: 10.762622,
  longitude: 106.6822,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function DiscoverScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterChip['value']>('nearby');
  const [seeding, setSeeding] = useState(false);
  const [showList, setShowList] = useState(false);

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
      const data = await restaurantApi.list({ status: 'APPROVED' });
      setRestaurants(data);
    } catch (error) {
      console.error('Load restaurants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedGooglePlaces = async () => {
    setSeeding(true);
    try {
      const result = await placesApi.seedNearby(region.latitude, region.longitude, 5);
      alert(
        `Đã seed từ Google Places!\nThêm mới: ${result.added}\nĐã có: ${result.skipped}`
      );
      await loadRestaurants();
    } catch (error: any) {
      alert('Lỗi seed: ' + (error?.message || 'Unknown'));
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
      {/* Map or Web fallback */}
      <View className="flex-1">
        {Platform.OS !== 'web' ? (
          <MapView
            ref={mapRef}
            className="w-full h-full"
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
            mapType={Platform.select({ android: 'standard', ios: 'mutedStandard' }) as any}
          >
            {filtered.map((r) => {
              if (!r.lat || !r.lng) return null;
              return (
                <Marker
                  key={r.id}
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

        {/* Top controls */}
        <View className="absolute top-4 left-4 right-4">
          {/* Seed button */}
          <TouchableOpacity
            className="self-end bg-espresso border border-gold rounded-full px-5 py-2.5 shadow-lg"
            onPress={handleSeedGooglePlaces}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator color="#FDF5E6" size="small" />
            ) : (
              <Text className="text-cream font-bold text-sm">🌐 Seed Google</Text>
            )}
          </TouchableOpacity>
        </View>

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
                  {selected.ratingAvg && (
                    <View className="bg-gold-soft px-2.5 py-1 rounded-xl border border-gold-light flex-row items-center">
                      <Text className="text-gold font-bold text-xs">★</Text>
                      <Text className="text-espresso text-xs font-bold ml-1">
                        {selected.ratingAvg.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  {selected.category && (
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
        <View className="absolute bottom-0 left-0 right-0 bg-cream-beige rounded-t-4xl shadow-xl border-t border-borderbrown">
          {/* Handle */}
          <TouchableOpacity
            className="items-center py-3"
            onPress={() => setShowList(!showList)}
          >
            <View className="w-12 h-1.5 bg-borderbrown rounded-full" />
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
      </View>
    </SafeAreaView>
  );
}