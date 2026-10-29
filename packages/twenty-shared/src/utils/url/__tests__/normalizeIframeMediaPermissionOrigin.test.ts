import { normalizeIframeMediaPermissionOrigin } from '../normalizeIframeMediaPermissionOrigin';

describe('normalizeIframeMediaPermissionOrigin', () => {
  it('normalizes exact HTTPS origins', () => {
    expect(
      normalizeIframeMediaPermissionOrigin('https://PHONE.example.com:443/'),
    ).toBe('https://phone.example.com');
  });

  it.each([
    'http://phone.example.com',
    'https://*.example.com',
    'https://phone.example.com/calls',
    'https://user@phone.example.com',
    'https://phone.example.com?camera=true',
    'https://phone.example.com\n',
    'data:text/html,phone',
  ])('rejects an invalid media origin: %s', (origin) => {
    expect(normalizeIframeMediaPermissionOrigin(origin)).toBeUndefined();
  });
});
