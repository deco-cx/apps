export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const haversine = (coordinate1: string, coordinate2: string): number => {
  const [lat1, lng1] = coordinate1.split(",").map((value) => Number(value));
  const [lat2, lng2] = coordinate2.split(",").map((value) => Number(value));

  const earthRadius = 6371000; // Earth radius in meters
  const dLat = toRadians(lat1 - lat2);
  const dLon = toRadians(lng1 - lng2);

  const halfChordLengthSquared =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2));

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(halfChordLengthSquared),
      Math.sqrt(1 - halfChordLengthSquared)
    );
  return earthRadius * angularDistance;
};


