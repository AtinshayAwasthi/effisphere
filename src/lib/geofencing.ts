export interface WorkLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export class GeofencingService {
  private static readonly EARTH_RADIUS = 6371000; // Earth's radius in meters

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c;
  }

  static isWithinGeofence(
    userLat: number,
    userLon: number,
    location: WorkLocation
  ): boolean {
    const distance = this.calculateDistance(
      userLat,
      userLon,
      location.latitude,
      location.longitude
    );
    return distance <= location.radius;
  }

  static findNearestLocation(
    userLat: number,
    userLon: number,
    locations: WorkLocation[]
  ): { location: WorkLocation; distance: number } | null {
    if (locations.length === 0) return null;

    let nearest = locations[0];
    let minDistance = this.calculateDistance(userLat, userLon, nearest.latitude, nearest.longitude);

    for (let i = 1; i < locations.length; i++) {
      const distance = this.calculateDistance(userLat, userLon, locations[i].latitude, locations[i].longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = locations[i];
      }
    }

    return { location: nearest, distance: minDistance };
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}