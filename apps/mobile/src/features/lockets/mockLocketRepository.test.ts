import assert from 'node:assert/strict';
import test from 'node:test';
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
  assert.equal(mine.some((locket) => locket.id === created.id), true);
  assert.equal((await mockLocketRepository.getById(created.id)).dishName, 'Bánh cuốn');

  const updated = await mockLocketRepository.update(created.id, {
    restaurantName: null,
    note: null,
    visibility: 'PUBLIC',
  });
  assert.equal(updated.restaurantName, undefined);
  assert.equal(updated.note, undefined);
  assert.equal(updated.visibility, 'PUBLIC');

  await mockLocketRepository.delete(created.id);
  await assert.rejects(() => mockLocketRepository.getById(created.id), /Không tìm thấy locket/);
});
