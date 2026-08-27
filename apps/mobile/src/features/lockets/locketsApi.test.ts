import { assertValidCaptureMetadata, locketApi } from '../../api/endpoints/lockets';
import { test, expect, jest } from '@jest/globals';

const mockPost = jest.fn();

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('../../api/client', () => ({ default: { post: mockPost } }));

test('fails closed when device hash is missing', () => {
  expect(() => assertValidCaptureMetadata({
    capturedAt: new Date().toISOString(),
    deviceHash: undefined as never,
  })).toThrow('Thiếu định danh thiết bị');
});

test('does not send an upload when capture metadata is missing', async () => {
  await expect(locketApi.create({
    localImageUri: 'file:///camera/locket.jpg',
    mimeType: 'image/jpeg',
    visibility: 'PRIVATE',
    latitude: 10.7769,
    longitude: 106.7009,
    capturedAt: undefined as never,
    deviceHash: undefined as never,
  })).rejects.toThrow('Thiếu định danh thiết bị');
  expect(mockPost).not.toHaveBeenCalled();
});

test('fails closed when capture timestamp is missing or invalid', () => {
  expect(() => assertValidCaptureMetadata({
    capturedAt: undefined as never,
    deviceHash: 'a'.repeat(64),
  })).toThrow('Thiếu thời điểm chụp');

  expect(() => assertValidCaptureMetadata({
    capturedAt: 'not-a-timestamp',
    deviceHash: 'a'.repeat(64),
  })).toThrow('Thiếu thời điểm chụp');
});

test('accepts complete capture metadata', () => {
  expect(() => assertValidCaptureMetadata({
    capturedAt: new Date().toISOString(),
    deviceHash: 'a'.repeat(64),
  })).not.toThrow();
});
