import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { stewardApi, PendingRestaurant, StewardStats } from '@/api';

export default function StewardDashboardScreen() {
  const [pending, setPending] = useState<PendingRestaurant[]>([]);
  const [stats, setStats] = useState<StewardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        stewardApi.getStats(),
        stewardApi.getPending(),
      ]);
      setStats(statsRes);
      setPending(listRes);
    } catch (error: any) {
      console.error('Load steward data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Bạn có quyền Steward không?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string, name: string) => {
    Alert.alert('Duyệt quán', `Duyệt "${name}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Duyệt',
        onPress: async () => {
          setProcessingId(id);
          try {
            const res = await stewardApi.approve(id);
            Alert.alert('Thành công', res.message);
            await loadData();
          } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể duyệt quán.');
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const handleReject = async (id: string, name: string) => {
    Alert.prompt(
      'Từ chối quán',
      `Nhập lý do từ chối "${name}":`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async (reason?: string) => {
            const trimmed = (reason || '').trim();
            if (trimmed.length < 5) {
              Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).');
              return;
            }
            setProcessingId(id);
            try {
              const res = await stewardApi.reject(id, trimmed);
              Alert.alert('Đã từ chối', res.message);
              await loadData();
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể từ chối quán.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const renderItem = ({ item }: { item: PendingRestaurant }) => {
    const isProcessing = processingId === item.id;
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-secondary-100 shadow-sm">
        {/* Header */}
        <View className="flex-row items-start mb-2">
          <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
            <Text className="text-lg">🍜</Text>
          </View>
          <View className="flex-1">
            <Text className="text-secondary-800 font-bold text-lg">{item.name}</Text>
            {item.address && (
              <Text className="text-secondary-500 text-sm mt-1">📍 {item.address}</Text>
            )}
          </View>
        </View>

        {/* Meta */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {item.category && (
            <View className="bg-secondary-50 px-3 py-1 rounded-full">
              <Text className="text-secondary-600 text-xs">{item.category}</Text>
            </View>
          )}
          {item.priceLevel && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-medium">
                {'$'.repeat(item.priceLevel)}
              </Text>
            </View>
          )}
          <View className="bg-accent/10 px-3 py-1 rounded-full">
            <Text className="text-accent text-xs font-medium">
              👤 User-submitted
            </Text>
          </View>
        </View>

        {/* Date */}
        <Text className="text-secondary-400 text-xs mb-3">
          Đăng lúc {new Date(item.createdAt).toLocaleString('vi-VN')}
        </Text>

        {/* Actions */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-secondary-100 rounded-xl py-3 items-center"
            onPress={() => handleReject(item.id, item.name)}
            disabled={isProcessing}
          >
            <Text className="text-secondary-700 font-semibold">Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3 items-center ${
              isProcessing ? 'bg-primary/50' : 'bg-primary'
            }`}
            onPress={() => handleApprove(item.id, item.name)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold">✓ Duyệt</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C68E17" size="large" />
        <Text className="text-secondary-500 mt-3">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={pending}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#C68E17"
          />
        }
        ListHeaderComponent={
          <View>
            <Text className="text-2xl font-bold text-secondary-800 mb-1">
              🛡️ Steward Dashboard
            </Text>
            <Text className="text-secondary-500 mb-4">
              Duyệt quán do người dùng đề xuất
            </Text>

            {/* Stats cards */}
            {stats && (
              <View className="flex-row gap-2 mb-4">
                <View className="flex-1 bg-primary/10 rounded-xl p-3">
                  <Text className="text-2xl font-bold text-primary">{stats.pending}</Text>
                  <Text className="text-secondary-600 text-xs">Chờ duyệt</Text>
                </View>
                <View className="flex-1 bg-green-100 rounded-xl p-3">
                  <Text className="text-2xl font-bold text-green-700">{stats.approved}</Text>
                  <Text className="text-secondary-600 text-xs">Đã duyệt</Text>
                </View>
                <View className="flex-1 bg-red-100 rounded-xl p-3">
                  <Text className="text-2xl font-bold text-red-700">{stats.rejected}</Text>
                  <Text className="text-secondary-600 text-xs">Từ chối</Text>
                </View>
              </View>
            )}

            <Text className="text-secondary-700 font-semibold mb-2">
              {pending.length} quán chờ duyệt
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center border-2 border-dashed border-secondary-200 mt-4">
            <Text className="text-5xl mb-3">🎉</Text>
            <Text className="text-secondary-600 font-medium">Không có quán nào chờ duyệt</Text>
            <Text className="text-secondary-400 text-sm mt-1">Mọi thứ đã được xử lý!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}