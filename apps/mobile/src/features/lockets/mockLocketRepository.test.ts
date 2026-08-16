import { mockLocketRepository } from './mockLocketRepository';

test('supports the mobile create, feed, detail, and delete flow', async () => {
  const created = await mockLocketRepository.create({
    localImageUri: 'file:///camera/locket.jpg',
    mimeType: 'image/jpeg',
    dishName: 'Bánh cuốn',
    restaurantName: 'Quán Nhà',
    note: 'Vừa chụp xong',
    rating: 5,
    tags: ['bữa sáng'],
    visibility: 'PRIVATE',
    capturedAt: new Date().toISOString(),
    location: { latitude: 10.7769, longitude: 106.7009 },
    deviceHash: 'a'.repeat(64),
  });

  const mine = await mockLocketRepository.getFeed('MINE');
  expect(mine.some((locket) => locket.id === created.id)).toBe(true);
  expect((await mockLocketRepository.getById(created.id)).dishName).toBe('Bánh cuốn');

  const updated = await mockLocketRepository.update(created.id, {
    restaurantName: null,
    note: null,
    visibility: 'PUBLIC',
  });
  expect(updated.restaurantName).toBeUndefined();
  expect(updated.note).toBeUndefined();
  expect(updated.visibility).toBe('PUBLIC');

  await mockLocketRepository.delete(created.id);
  await expect(mockLocketRepository.getById(created.id)).rejects.toThrow(/Không tìm thấy Taste Board/);
});
