import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Dimensions,
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
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
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
    <SafeAreaView className="flex-1 bg-background">
      {/* Map or Web fallback */}
      <View className="flex-1">
        {MapView ? (
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
          <View className="flex-1 bg-gray-100 items-center justify-center">
            <Text className="text-text-muted">Bản đồ chỉ khả dụng trên mobile</Text>
            <Text className="text-text-muted text-sm mt-1">Map available on mobile only</Text>
          </View>
        )}

        {/* Loading overlay */}
        {loading && (
          <View className="absolute inset-0 bg-black/20 items-center justify-center">
            <ActivityIndicator color="#C68E17" size="large" />
          </View>
        )}

        {/* Top controls */}
        <View className="absolute top-4 left-4 right-4">
          {/* Seed button */}
          <TouchableOpacity
            className="self-end bg-accent rounded-full px-4 py-2 shadow-md"
            onPress={handleSeedGooglePlaces}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator color="#3D2314" size="small" />
            ) : (
              <Text className="text-primary font-semibold text-sm">🌐 Seed</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Selected restaurant card */}
        {selected && (
          <View
            className="absolute bottom-28 left-4 right-4 bg-surface rounded-2xl p-4 shadow-lg border border-border"
            style={{ marginBottom: 80 }}
          >
            <TouchableOpacity
              className="absolute top-2 right-2 w-7 h-7 bg-secondary-200 rounded-full items-center justify-center"
              onPress={() => setSelectedId(null)}
            >
              <Text className="text-secondary-500 text-sm">✕</Text>
            </TouchableOpacity>

            <View className="flex-row items-start">
              <View
                className="w-2 rounded-full mr-3"
                style={{ backgroundColor: pinColor(selected.ratingAvg ?? 0), minHeight: 40 }}
              />
              <View className="flex-1">
                <Text className="text-primary font-bold text-base">{selected.name}</Text>
                <Text className="text-text-muted text-xs mt-0.5" numberOfLines={1}>
                  {selected.address}
                </Text>
                <View className="flex-row items-center mt-1 gap-2">
                  {selected.ratingAvg && (
                    <View className="bg-accent/10 px-2 py-0.5 rounded flex-row items-center">
                      <Text className="text-accent text-xs font-bold">★</Text>
                      <Text className="text-accent text-xs font-semibold ml-0.5">
                        {selected.ratingAvg.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  {selected.category && (
                    <Text className="text-text-muted text-xs">{selected.category}</Text>
                  )}
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-2.5 items-center"
                onPress={() => router.push(`/restaurant/${selected.id}`)}
              >
                <Text className="text-white font-semibold text-sm">Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 bg-accent rounded-xl py-2.5 items-center"
                onPress={() => openExternalMaps(selected)}
              >
                <Text className="text-primary text-base">📍</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom panel */}
        <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-lg border-t border-border">
          {/* Handle */}
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => setShowList(!showList)}
          >
            <View className="w-10 h-1 bg-border rounded-full" />
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
                className={`px-3 py-1.5 rounded-full ${filter === f.value ? 'bg-primary' : 'bg-background border border-border'
                  }`}
                onPress={() => setFilter(f.value)}
              >
                <Text
                  className={`text-xs font-medium ${filter === f.value ? 'text-white' : 'text-primary'
                    }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Restaurant count */}
          <Text className="px-4 text-text-muted text-xs mb-1">
            {filtered.length} quán {filter === 'nearby' ? 'trong 5km' : ''}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}