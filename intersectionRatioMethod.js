import { area, centroid, circle, intersect, point, polygon } from "@turf/turf";
import axios from "axios";

import { logger } from "./utils/logger.js";
import {
  simplifyAreaMSqKm,
  simplifyAreaKSqKm,
  getEqualAreaCircle,
  RatioToRoundPercentText,
  meterToKilometer,
} from "./utils/turfGeometry.js";

// check overlap with same area and same centroid circle, calculate ratio

logger.info("========[START]========");

const url =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson";

axios.get(url).then((res) => {
  logger.debug("Got result from url:", res.data.type !== undefined);
  const countries = res.data;

  const countryRatioList = getCountryRatioList(countries);

  logger.info("[FULL COUNTRY RATIO LIST]");

  // sort by ratio percent
  const sorted = countryRatioList.sort((a, b) => {
    const aPercent = parseFloat(a.percent);
    const bPercent = parseFloat(b.percent);
    if (aPercent < bPercent) return 1;
    if (aPercent > bPercent) return -1;
  });

  console.log(sorted);
});

function getCountryNameList(countries) {
  return countries.features.map((country) => country.properties.name);
}
function getCountryByName(countries, countryName) {
  return countries.features.find(
    (country) => country.properties.name === countryName
  );
}
function getIntersectionPolygon(polygon, overlapingPolygon) {
  logger.debug("  - getIntersectionPolygon");
  logger.debug(polygon.geometry.type);
  logger.debug(overlapingPolygon.geometry.type);
  if (
    polygon.geometry.type === "Polygon" &&
    overlapingPolygon.geometry.type === "Polygon"
  ) {
    return getIntersectionPolygonForSimplePolygon(polygon, overlapingPolygon);
  } else if (
    polygon.geometry.type === "Polygon" &&
    overlapingPolygon.geometry.type === "MultiPolygon"
  ) {
    return getIntersectionPolygonForMultiPolygon(overlapingPolygon, polygon);
  } else if (
    polygon.geometry.type === "MultiPolygon" &&
    overlapingPolygon.geometry.type === "Polygon"
  ) {
    return getIntersectionPolygonForMultiPolygon(polygon, overlapingPolygon);
  } else if (
    polygon.geometry.type === "MultiPolygon" &&
    overlapingPolygon.geometry.type === "MultiPolygon"
  ) {
    // create a list of polygons from the multiPolygon
    // then iterate over the list and get the intersection for each polygon with multipolygon function
    // then merge the list of polygons into a multiPolygon

    // const polygonList = createPListFromMultiP(polygon);
    // const overlapingPolygonList = polygonList.map((polygon) =>
    //   getIntersectionPolygonForMultiPolygon(overlapingPolygon, polygon)
    // );
    logger.debug("ERROR: not implemented yet");
    logger.debug("/ should intersect multipolygons /");
    // const mergedPolygon = mergePListIntoMultiP(overlapingPolygonList);
    // return mergedPolygon;
  } else {
    logger.debug("ERROR: unknown polygon type");
  }
}
function createPListFromMultiP(multiPolygon) {
  logger.debug("- createPListFromMultiP");
  logger.debug(multiPolygon.geometry.type);
  const polygons = multiPolygon.geometry.coordinates.map((polygon) => {
    const simplePolynom = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: polygon,
      },
    };
    logger.debug("simplePolynom");
    logger.debug(simplePolynom);
    return simplePolynom;
  });
  return polygons;
}
function mergePListIntoMultiP(polygonList) {
  logger.debug("- mergePListIntoMultiP");
  logger.debug(polygonList);
  const multiPolygon = {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: polygonList.map((polygon) => polygon.geometry.coordinates),
    },
  };
  return multiPolygon;
}
function getIntersectionPolygonForMultiPolygon(
  multiPolygon,
  overlapingPolygon
) {
  logger.debug("- multi polygon overlap function");
  logger.debug(`  ${JSON.stringify(multiPolygon.geometry.type)}`);
  logger.debug(`  ${JSON.stringify(overlapingPolygon.geometry.type)}`);

  const polygons = createPListFromMultiP(multiPolygon);
  logger.debug(polygons);

  const intersectionPolygons = polygons.reduce(
    (polygonList, currentPolygon) => {
      const intersectionP = getIntersectionPolygonForSimplePolygon(
        currentPolygon,
        overlapingPolygon
      );
      if (intersectionP) {
        return [...polygonList, intersectionP];
      }
      return polygonList;
    },
    []
  );

  logger.debug(intersectionPolygons);
  const intersectionMultiPolygon = mergePListIntoMultiP(intersectionPolygons);
  return intersectionMultiPolygon;
}
function getIntersectionPolygonForSimplePolygon(polygon, overlapingPolygon) {
  logger.debug("- polygon overlap function");
  logger.debug(`  ${JSON.stringify(polygon.geometry.type)}`);
  logger.debug(`  ${JSON.stringify(overlapingPolygon.geometry.type)}`);
  const isOnDateLine = isPolygonOnInternationalDateLine(polygon);

  if (isOnDateLine) {
    const polygon1 = polygon;
    const polygon2 = polygon;
    logger.debug("XXX");
    polygon1.geometry.coordinates[0].forEach((coord) => {
      if (coord[0] < 0) {
        coord[0] = coord[0] + 360;
      }
    });
    logger.debug("YYY");
    polygon2.geometry.coordinates[0].forEach((coord) => {
      if (coord[0] > 0) {
        coord[0] = coord[0] - 360;
      }
    });
    logger.debug("ZZZ");

    const overlap1 = intersect(polygon1, overlapingPolygon);
    const overlap2 = intersect(polygon2, overlapingPolygon);
    const overlapDateLine = overlap1.geometry.coordinates.concat(
      overlap2.geometry.coordinates
    );
    // console.log(`overlapDateLine: ${overlapDateLine}`);
    return overlapDateLine;
  }

  logger.debug(polygon.geometry.type);
  logger.debug(overlapingPolygon.geometry.type);

  const overlap = intersect(polygon, overlapingPolygon);
  logger.verbose("  OVERLAP");
  logger.verbose(`  ${JSON.stringify(overlap)}`);
  // const overlapArea = area(overlap);
  // const overlapAreaString = simplifyAreaKSqKm(overlapArea);
  return overlap;
}
function pOverlapRatio(polygon, overlapingPolygon) {
  logger.debug("- Polygon overlap ratio function");
  logger.debug(`  ${JSON.stringify(polygon.geometry.type)}`);
  logger.debug(`  ${JSON.stringify(overlapingPolygon.geometry.type)}`);

  const overlap = getIntersectionPolygon(polygon, overlapingPolygon);
  logger.verbose(overlap);

  logger.debug(
    `  polygon centroid:      ${JSON.stringify(
      centroid(polygon).geometry.coordinates
    )}`
  );

  const overlapArea = area(overlap);
  const polygonArea = area(polygon);

  const ratio = overlapArea / polygonArea;
  return ratio;
}
function getCountryRatioList(countries) {
  const countryNameList = getCountryNameList(countries);

  const countryRatioList = countryNameList.map((countryName) => {
    logger.debug(`[COUNTRY: ${countryName}]`);

    const country = getCountryByName(countries, countryName);
    const equalAreaCircle = getEqualAreaCircle(country);
    const ratio = pOverlapRatio(country, equalAreaCircle);
    const percent = RatioToRoundPercentText(ratio);

    return { countryName, percent };
  });
  return countryRatioList;
}
function isPolygonOnInternationalDateLine(polygon) {
  logger.debug("  - Dateline check function");
  // console.log("================= FULL POLYGON OBJECT");
  // console.log(JSON.stringify(polygon));

  logger.debug(`    polygon size: ${polygon.geometry.coordinates[0].length}`);

  const easternmostPoint = getEasternmostPoint(polygon);
  const westernmostPoint = getWesternmostPoint(polygon);
  // if easternmost point is west of westernmost point, then country is on international date line

  const isOnInternationalDateLine = easternmostPoint[0] < westernmostPoint[0];
  logger.debug(
    `  east/west: is overlap on date line?: ${isOnInternationalDateLine}`
  );

  return isOnInternationalDateLine;
}
function flattenMultiPolygonCoordinates(coordinates) {
  return coordinates.reduce((acc, curr) => {
    return acc.concat(curr[0]);
  }, []);
}
function getEasternmostPoint(country) {
  logger.debug("  - easternmost point function");
  let coordinates;
  if (country.geometry.type === "MultiPolygon") {
    logger.debug(`    - geo type: ${country.geometry.type}`);
    // create a flat array of all polygon coordinates
    coordinates = flattenMultiPolygonCoordinates(country.geometry.coordinates);
  } else {
    logger.debug(`   - geo type: ${country.geometry.type}`);
    coordinates = country.geometry.coordinates[0];
  }

  const easternmostPoint = coordinates.reduce((easternmostPoint, point) => {
    if (point[0] > easternmostPoint[0]) {
      return point;
    }
    return easternmostPoint;
  }, coordinates[0]);
  logger.debug(`    - east end: [${easternmostPoint}]`);
  return easternmostPoint;
}
function getWesternmostPoint(country) {
  logger.debug("  - westernmost point function");
  let coordinates;
  if (country.geometry.type === "MultiPolygon") {
    logger.debug(`    - geo type: ${country.geometry.type}`);
    // create a flat array of all polygon coordinates
    coordinates = flattenMultiPolygonCoordinates(country.geometry.coordinates);
  } else {
    logger.debug(`    - geo type: ${country.geometry.type}`);
    coordinates = country.geometry.coordinates[0];
  }

  const westernmostPoint = coordinates.reduce((westernmostPoint, point) => {
    if (point[0] < westernmostPoint[0]) {
      return point;
    }
    return westernmostPoint;
  }, coordinates[0]);
  logger.debug(`    - west end: [${westernmostPoint}]`);
  return westernmostPoint;
}
