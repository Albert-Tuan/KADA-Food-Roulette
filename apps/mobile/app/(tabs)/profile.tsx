import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useMyProfile } from '@/features/profile';
import { useLocketFeed, type Locket } from '@/features/lockets';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const profile = useMyProfile();
  const myLockets = useLocketFeed('MINE');
  const logout = useAuthStore((state) => state.logout);
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState<'lockets' | 'achievements'>('lockets');
  const [allergies, setAllergies] = useState({
    seafood: false,
    peanut: true,
    milk: false,
    gluten: false,
    egg: false,
  });

  const toggleAllergy = (key: keyof typeof allergies) => {
    setAllergies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (profile.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#b52330" size="large" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || profile.isError || !profile.data) {
    return (
      <SafeAreaView testID="profile-guest-screen" className="flex-1 items-center justify-center px-8 bg-surface">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg bg-primary">
          <Text className="text-5xl">👤</Text>
        </View>
        <Text className="text-2xl font-black text-center mb-2 text-primary">
          Hồ Sơ Cá Nhân
        </Text>
        <Text className="text-center font-medium text-sm leading-6 mb-8 text-secondary">
          Đăng nhập để theo dõi streak, lưu món ăn yêu thích và chia sẻ Taste Board cùng bạn bè!
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="w-full rounded-2xl py-4 border-b-4 shadow-md items-center justify-center flex-row gap-2 mb-3 active:translate-y-0.5"
        >
          <Ionicons name="log-in-outline" size={18} color="#ffffff" />
          <Text className="text-white font-extrabold text-base">Đăng nhập / Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              await login('locket-test@foodroulette.app', 'password123');
              profile.refetch();
            } catch {
              router.push('/auth/login');
            }
          }}
          className="w-full rounded-2xl py-3.5 border-1.5 items-center justify-center flex-row gap-2 bg-white shadow-xs border-outline-variant active:bg-orange-50"
        >
          <Ionicons name="flash-outline" size={18} color="#b52330" />
          <Text className="font-bold text-base text-primary">Trải nghiệm tài khoản Demo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const data = profile.data;
  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView testID="profile-private-screen" className="flex-1 bg-surface" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View className="items-center px-5 pt-6 pb-4">
          <View className="relative">
            {data.avatarUrl ? (
              <Image 
                source={{ uri: data.avatarUrl }} 
                className="w-24 h-24 rounded-full border-3 shadow-md" 
                style={{ backgroundColor: '#ffdcc4', borderColor: '#ffab69' }} 
              />
            ) : (
              <View 
                className="w-24 h-24 rounded-full border-3 items-center justify-center shadow-lg" 
                style={{ backgroundColor: '#b52330', borderColor: '#ffab69' }}
              >
                <Text className="text-4xl font-black text-white">{data.displayNamePublic.slice(0, 1)}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full items-center justify-center shadow-sm border border-outline-variant">
              <Text className="text-xs">⭐</Text>
            </View>
          </View>

          <Text testID="profile-private-display-name" className="text-2xl font-black mt-3.5 text-primary">
            {data.displayNamePrivate}
          </Text>
          <Text className="font-bold text-xs mt-0.5 text-secondary">
            Tên công khai: {data.displayNamePublic} • @{data.publicId}
          </Text>
          {data.bio ? (
            <Text className="text-on-surface-variant text-center leading-5 mt-2 px-4 font-medium text-xs">
              {data.bio}
            </Text>
          ) : null}

        {/* Quick Actions Row */}
        <View className="flex-row items-center gap-2 mt-3">
          <Link href="/profile/taste-preferences" asChild>
            <TouchableOpacity className="flex-1 px-3 py-2 rounded-full bg-amber-100/90 border border-amber-300 flex-row items-center justify-center gap-1.5 shadow-xs">
              <Ionicons name="options-outline" size={14} color="#78350f" />
              <Text className="text-amber-900 font-bold text-xs">Khẩu Vị AI</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            onPress={() => router.push('/friends' as any)}
            className="flex-1 px-3 py-2 rounded-full bg-red-100/90 border border-red-300 flex-row items-center justify-center gap-1.5 shadow-xs"
          >
            <Ionicons name="people-outline" size={14} color="#b52330" />
            <Text className="text-primary font-bold text-xs">Bạn Bè & Lời Mời</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View className="flex-row w-full justify-around bg-white border-1.5 rounded-3xl py-4 mt-5 shadow-xs" style={{ borderColor: '#e2bebc' }}>
          <Stat value={data.stats.locketCount || myLockets.data?.length || 0} label="Taste Board" icon="📸" />
          <View className="w-px bg-outline-variant/60 my-1" />
          <Stat value={data.stats.checkInCount || 12} label="Check-in" icon="📍" />
          <View className="w-px bg-outline-variant/60 my-1" />
          <Stat value={7} label="Ngày Streak" icon="🔥" />
        </View>
      </View>

      {/* Section: Taste Profile Radar Chart */}
      <View className="mx-5 mb-4 bg-white rounded-3xl p-5 border-1.5 shadow-xs" style={{ borderColor: '#e2bebc' }}>
        <Text className="text-base font-black text-primary mb-1">Gu ẩm thực của bạn</Text>
        <Text className="text-xs text-on-surface-variant mb-4 font-medium">Phân tích khẩu vị dựa trên các lần quay và Taste Board</Text>
        
        {/* SVG Radar Chart */}
        <View className="items-center justify-center my-2">
          <TasteRadarChart />
        </View>

        <Text className="text-center font-bold text-xs text-secondary mt-3">
          Bạn là tín đồ của vị <Text className="text-primary font-black">Cay</Text> và <Text className="text-primary font-black">Ngọt</Text>!
        </Text>
      </View>

      {/* Section: Allergy Settings */}
      <View className="mx-5 mb-5 bg-white rounded-3xl p-5 border-1.5 shadow-xs" style={{ borderColor: '#e2bebc' }}>
        <Text className="text-base font-black text-primary mb-1">Thiết lập Dị ứng</Text>
        <Text className="text-xs text-on-surface-variant mb-3 font-medium">Tự động loại trừ các quán có thành phần gây dị ứng khỏi vòng quay.</Text>
        
        <View className="gap-2.5">
          <AllergyItem icon="🦐" label="Hải sản & Tôm cua" value={allergies.seafood} onToggle={() => toggleAllergy('seafood')} />
          <AllergyItem icon="🥜" label="Đậu phộng & Hạt" value={allergies.peanut} onToggle={() => toggleAllergy('peanut')} />
          <AllergyItem icon="🥛" label="Sữa & Lactose" value={allergies.milk} onToggle={() => toggleAllergy('milk')} />
          <AllergyItem icon="🌾" label="Gluten & Bột mì" value={allergies.gluten} onToggle={() => toggleAllergy('gluten')} />
          <AllergyItem icon="🥚" label="Trứng" value={allergies.egg} onToggle={() => toggleAllergy('egg')} />
        </View>
      </View>

      {/* Section: Lockets Grid & Achievements Tabs */}
      <View className="mx-5 mb-5">
        {/* Tab Selector */}
        <View className="flex-row border-b border-outline-variant/60 mb-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('lockets')} 
            className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'lockets' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`font-black text-sm ${activeTab === 'lockets' ? 'text-primary' : 'text-on-surface-variant'}`}>
              Taste Board của tôi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('achievements')} 
            className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'achievements' ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`font-black text-sm ${activeTab === 'achievements' ? 'text-primary' : 'text-on-surface-variant'}`}>
              Thành tích & Huy hiệu
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'lockets' ? (
          myLockets.data && myLockets.data.length > 0 ? (
            <View className="flex-row flex-wrap gap-2.5">
              {myLockets.data.map((locket: Locket) => (
                <Link key={locket.id} href={`/locket/${locket.id}` as any} asChild>
                  <TouchableOpacity 
                    className="rounded-2xl overflow-hidden shadow-xs border border-outline-variant bg-stone-100"
                    style={{ width: '48%', aspectRatio: 1 }}
                  >
                    <Image source={{ uri: locket.imageUrl }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute bottom-0 left-0 right-0 p-2" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                      <Text className="text-white font-bold text-xs" numberOfLines={1}>
                        {locket.dishName || 'Món ngon'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 border border-outline-variant items-center">
              <Text className="text-3xl mb-2">📸</Text>
              <Text className="font-bold text-sm text-secondary text-center">Chưa có bài đăng nào</Text>
              <Link href="/locket/capture" asChild>
                <TouchableOpacity className="mt-3 px-5 py-2.5 rounded-full bg-primary flex-row items-center gap-1.5">
                  <Ionicons name="camera-outline" size={16} color="#ffffff" />
                  <Text className="text-white font-bold text-xs">Chụp món đầu tiên</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )
        ) : (
          <View className="bg-white rounded-3xl p-5 border border-outline-variant gap-3">
            <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <Text className="text-2xl">🔥</Text>
              <View className="flex-1">
                <Text className="font-black text-sm text-amber-900">Chiến thần Ăn Uống</Text>
                <Text className="text-xs text-amber-700">Duy trì streak 7 ngày liên tiếp</Text>
              </View>
              <Text className="text-xs font-bold text-amber-900">Hoàn thành</Text>
            </View>
            <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <Text className="text-2xl">🍜</Text>
              <View className="flex-1">
                <Text className="font-bold text-sm text-on-surface">Thực Thần Phố Cổ</Text>
                <Text className="text-xs text-on-surface-variant">Check-in 10 quán phở khác nhau</Text>
              </View>
              <Text className="text-xs font-bold text-secondary">3/10</Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu Links */}
      <View className="px-5 gap-2.5">
        <MenuLink testID="profile-edit-link" href="/profile/edit" title="Chỉnh sửa hồ sơ" iconName="create-outline" />
        <MenuLink testID="profile-public-link" href={`/u/${data.publicId}`} title="Xem trang cá nhân công khai" iconName="globe-outline" />
        <MenuLink testID="profile-settings-link" href="/profile/settings" title="Cài đặt ứng dụng" iconName="settings-outline" />
        <TouchableOpacity 
          onPress={handleLogout} 
          className="bg-white border-1.5 rounded-2xl p-4 mt-2 flex-row justify-center items-center gap-2 shadow-xs active:bg-red-50" 
          style={{ borderColor: '#e2bebc' }}
        >
          <Ionicons name="log-out-outline" size={18} color="#b52330" />
          <Text className="font-black text-base text-primary">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

function Stat({ value, label, icon }: { value: number; label: string; icon: string }) {
return (
  <View className="items-center flex-1">
    <Text className="text-lg">{icon}</Text>
    <Text className="text-xl font-black text-primary mt-0.5">{value}</Text>
    <Text className="text-[11px] font-bold text-on-surface-variant mt-0.5">{label}</Text>
  </View>
);
}

function AllergyItem({ icon, label, value, onToggle }: { icon: string; label: string; value: boolean; onToggle: () => void }) {
return (
  <View className="flex-row items-center justify-between p-3 rounded-2xl bg-surface-low border border-outline-variant/60">
    <View className="flex-row items-center gap-2.5">
      <Text className="text-lg">{icon}</Text>
      <Text className="font-bold text-xs text-on-surface">{label}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onToggle}
      trackColor={{ false: '#e2bebc', true: '#b52330' }}
      thumbColor="#ffffff"
    />
  </View>
);
}

function MenuLink({ href, title, iconName, testID }: { href: '/profile/edit' | '/profile/taste-preferences' | '/profile/settings' | `/u/${string}`; title: string; iconName: keyof typeof Ionicons.glyphMap; testID?: string }) {
return (
  <Link href={href as any} asChild>
    <TouchableOpacity 
      testID={testID}
      className="bg-white border-1.5 rounded-2xl p-4 flex-row items-center justify-between shadow-xs active:bg-orange-50" 
      style={{ borderColor: '#e2bebc' }}
    >
      <View className="flex-row items-center gap-2.5">
        <Ionicons name={iconName} size={18} color="#b52330" />
        <Text className="font-bold text-sm text-primary">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8e4e14" />
    </TouchableOpacity>
  </Link>
);
}

function TasteRadarChart() {
  const size = 180;
  const center = size / 2;
  const radius = 65;
  const numPoints = 5;
  const labels = ['Cay', 'Ngọt', 'Thanh đạm', 'Đậm đà', 'Chua'];
  const userScores = [0.9, 0.85, 0.5, 0.75, 0.6]; // Normalized 0-1

  // Outer Grid Circles/Polygons
  const gridLevels = [0.33, 0.66, 1.0];

  const getPoint = (index: number, score: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const x = center + radius * score * Math.cos(angle);
    const y = center + radius * score * Math.sin(angle);
    return { x, y };
  };

  const userPolygonPoints = userScores
    .map((score, i) => {
      const pt = getPoint(i, score);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <Svg width={size} height={size}>
      {/* Background Web Rings */}
      {gridLevels.map((lvl) => {
        const ringPoints = Array.from({ length: numPoints })
          .map((_, i) => {
            const pt = getPoint(i, lvl);
            return `${pt.x},${pt.y}`;
          })
          .join(' ');
        return (
          <Polygon
            key={lvl}
            points={ringPoints}
            fill="none"
            stroke="#e2bebc"
            strokeWidth="1"
            strokeDasharray={lvl === 1.0 ? undefined : '2,2'}
          />
        );
      })}

      {/* Axis Lines */}
      {Array.from({ length: numPoints }).map((_, i) => {
        const pt = getPoint(i, 1.0);
        return (
          <Line
            key={i}
            x1={center}
            y1={center}
            x2={pt.x}
            y2={pt.y}
            stroke="#e2bebc"
            strokeWidth="1"
          />
        );
      })}

      {/* User Taste Polygon Shape */}
      <Polygon
        points={userPolygonPoints}
        fill="rgba(181, 35, 48, 0.22)"
        stroke="#b52330"
        strokeWidth="2.5"
      />

      {/* Point Dots */}
      {userScores.map((score, i) => {
        const pt = getPoint(i, score);
        return <Circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#b52330" />;
      })}

      {/* Axis Labels */}
      {labels.map((label, i) => {
        const pt = getPoint(i, 1.28);
        return (
          <SvgText
            key={label}
            x={pt.x}
            y={pt.y + 4}
            fontSize="10"
            fontWeight="bold"
            fill="#5a403f"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}
