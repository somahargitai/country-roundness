import { area, centroid, circle, intersect, point, polygon } from "@turf/turf";

import { logger } from "./logger.js";

function getCentroidFromCountryName(countries, countryName) {
  return getCentroidFromCountryData(getCountryByName(countries, countryName));
}
function getCentroidFromCountryData(country) {
  return centroid(country);
}
function simplifyAreaMSqKm(areaInSquareKilometers) {
  const areaInMegaSquareKilometers = areaInSquareKilometers / 1000000;
  const roundedArea =
    Math.round(areaInMegaSquareKilometers * 100) / 100 / 1000000;
  const areaString = `${roundedArea} 10^6 km2`;
  return areaString;
}
function simplifyAreaKSqKm(areaInSquareKilometers) {
  const areaInKiloSquareKilometers = areaInSquareKilometers / 1000 / 1000000;
  const roundedArea = Math.round(areaInKiloSquareKilometers * 100) / 100;
  const areaString = `${roundedArea} 10^3 km2`;
  return areaString;
}
function getEqualAreaCircle(country) {
  const areaOfCountry = area(country);
  const radius = Math.sqrt(areaOfCountry / Math.PI);
  const center = centroid(country);
  const circleOptions = {
    steps: 100,
    units: "meters",
    properties: { foo: "bar" },
  };
  const circleUSA = circle(center, radius, circleOptions);
  return circleUSA;
}
function meterToKilometer(meter) {
  const inkm = meter / 1000;
  const rounded = Math.round(inkm * 100) / 100;
  const text = `${rounded} km`;
  return text;
}
function RatioToRoundPercentText(ratio) {
    const percent = ratio * 100;
    const roundedPercent = Math.round(percent * 100) / 100;
    return `${roundedPercent}%`;
  }

export {
    getCentroidFromCountryName,
    getCentroidFromCountryData,
    RatioToRoundPercentText,
    simplifyAreaMSqKm,
    simplifyAreaKSqKm,
    getEqualAreaCircle,
    meterToKilometer,
};
