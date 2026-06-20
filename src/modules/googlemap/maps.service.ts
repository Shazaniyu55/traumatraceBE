import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Thin wrapper around the Google Geocoding API.
 *
 * Used to turn a therapist's registered address (addressLine / city / country)
 * into coordinates so the directory can be searched by radius. Requires the
 * GOOGLE_MAPS_API_KEY env var; if it is missing, geocoding is skipped and the
 * caller falls back to whatever coordinates the app supplied directly.
 *
 * Uses the global `fetch` (Node 18+). No extra HTTP dependency required.
 */
@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey?: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('common.google.mapsApiKey');
    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not set — geocoding is disabled');
    }
  }

  async geocode(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey || !address?.trim()) return null;

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.set('address', address);
      url.searchParams.set('key', this.apiKey);

      const res = await fetch(url.toString());
      const data: any = await res.json();

      if (data.status !== 'OK' || !data.results?.length) {
        this.logger.warn(`Geocode failed for "${address}": ${data.status}`);
        return null;
      }

      const top = data.results[0];
      return {
        lat: top.geometry.location.lat,
        lng: top.geometry.location.lng,
        formattedAddress: top.formatted_address,
      };
    } catch (e) {
      this.logger.error(`Geocode error: ${(e as Error).message}`);
      return null;
    }
  }
}