# Roundness of Countries

This is a simple project to show the roundness of countries. The motivation was coming from Terrible Maps, showing some funny examples about country roundness. Special thanks for the guys in the Instagram comment zone. Some guy asked how we actually calculate the roundness of a country. Answering this question made me think about the question deeper - ending up with this project and three different approaches.

## What is the roundness?

The question of roundness sounds simple. Anyone can tell that an egg is round. Also most people would agree that Sierra Leone is rather round, while Italy is rather a high boot. But how do you actually measure it? How do you create a definition which is not subjective any more?

The answer is: You don't. There is no objective definition of roundness. But there are some definitions which are more objective than others. And this is what we are going to do here.

## Method 1: Similarity to a circle with the same perimeter

This is a common approach. Assuming that a circle is the perfect round shape, we can calculate the similarity of a country to a circle. This is done by calculating the area of the country and the area of a circle with the same perimeter. The ratio of these two areas is the similarity to a circle. The higher the ratio, the more round the country is.

- given: perimeter_country, area_country
- calculate roundness

$$ roundness = {{area\_country}\over{area\_circle\_same\_perimeter}} $$

- roundness case 1: the country is a circle, so $ roundness = 1 $

- roundness case 2: the country is a triangle

$$ 2r\pi = 3a $$
$$ roundness = {{a^2\sqrt{3} \over 8} \cdot \over r^2\pi} $$
$$ roundness ={ \sqrt{3} \cdot \pi \over 18} $$
$$ roundness = 0.302299894039036308432 $$

## Method 2: Similarity to a circle with the same area

This is the most common approach. Divide the perimeter of the country by the perimeter of the same area circle.

- calculate roundness:
  $$ roundness = perimeter_sameAreaCircle \over perimeter_country $$

- roundness case 1: the country is a circle, so $ roundness = 1 $

- roundness case 2: the country is a triangle

$$ r^2pi = {{{a\over2}\cdot{a\sqrt3 \over 2}} \over 2} $$

$$ roundness = {2r\pi \over 3a} = \sqrt{ \sqrt{3} \cdot \pi \over 18 } $$

$$ roundness = 0.549818055395633864 $$

This is actually the square root of the previous one

## Method 3: Similarity to a circle: equal area of country inside and out

This is actually a tricky one. My assumption was: draw a small circle in the centroid of the country Then step by step make it bigger and bigger. Stop when the circle intersects the country and the country part area not covered by the circle is equal to the circle parts not covered by the country. Use this circle to calculate the roundness.

When I started to create a function for it, I realized that this situation happens when the area of the country is equal to the area of the circle.
Hence it is equal to the previous method.

## Method 4: Roundness as Differentiableness deviation

This is rather a mathematical approach. In mathematics we call a function differentiable if it is possible to calculate the slope of the function at every given point - which means the curve has no sharp corners - you can draw an unequivocal tangent line at every point.

Here we want something similar: we expect from a round shape that if we draw a tangent line at every point, the tangent line slope is always similar to a circle's tangent line's slope.

In case of mathematical country borders, we would have shapes with mathematical functions as borders. It is not the case, country borders are usually drawn by humans, defined by lines between coordinates, hence they are polygons.

As in our case we have a polygon, there are no unequivocal tangents at the vertices, but we can use the sides as tangents (and ignore vertices). We would consider a regular polygon with lots of sides a good approximation of a circle, hence round.

**So let's approach it like this**: we draw a circle which has the country centroid as center. We draw as many radius lines as possible. We take the intersections of the radius lines with the country border. We calculate the slope of the polygon sides at each intersection. We calculate the slope of the tangent line of a circle in the point(s) defined by the same radius. We calculate the deviations of the two slopes. Perpendicularity means the maximum deviation, parallelism means the minimum deviation. Which means we take 1 as parallelism (0 degree) and 0 as perpendicularity (90 degree), so we should project 90 to zero degree to zero to 1 scale. We are normalizing the angles, so we don't have to take absolute values. Having the average of the deviations, we get the roundness of the country as
$$ 1 - average_of_deviations $$

**note**: _We may consider using the square root of the average of the deviations to show the roundness more clearly._

This approach requires as much radius lines as possible. The more radius lines we have, the more accurate the result. The good side of this one is that it is not dependent on the convexity of the country. A torus shaped country is still considered round.

## Data sources & tools

Thanks for the free geographic data:

- [Natural Earth](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/)
- <http://geojson.xyz/>
- [GeoJson Tools](https://geojson.tools/)

  <details>
  <summary>
  Iceland GeoJson object
  </summary>

  Copy this one into the GeoJson tools to see the result.

  ```json
  {
    "type": "Feature",
    "properties": {
      "scalerank": 1,
      "labelrank": 3,
      "sovereignt": "Iceland",
      "sov_a3": "ISL",
      "adm0_dif": 0,
      "level": 2,
      "type": "Sovereign country",
      "admin": "Iceland",
      "adm0_a3": "ISL",
      "geou_dif": 0,
      "geounit": "Iceland",
      "gu_a3": "ISL",
      "su_dif": 0,
      "subunit": "Iceland",
      "su_a3": "ISL",
      "brk_diff": 0,
      "name": "Iceland",
      "name_long": "Iceland",
      "brk_a3": "ISL",
      "brk_name": "Iceland",
      "brk_group": null,
      "abbrev": "Iceland",
      "postal": "IS",
      "formal_en": "Republic of Iceland",
      "formal_fr": null,
      "note_adm0": null,
      "note_brk": null,
      "name_sort": "Iceland",
      "name_alt": null,
      "mapcolor7": 1,
      "mapcolor8": 4,
      "mapcolor9": 4,
      "mapcolor13": 9,
      "pop_est": 306694,
      "gdp_md_est": 12710,
      "pop_year": -99,
      "lastcensus": -99,
      "gdp_year": -99,
      "economy": "2. Developed region: nonG7",
      "income_grp": "1. High income: OECD",
      "wikipedia": -99,
      "fips_10": null,
      "iso_a2": "IS",
      "iso_a3": "ISL",
      "iso_n3": "352",
      "un_a3": "352",
      "wb_a2": "IS",
      "wb_a3": "ISL",
      "woe_id": -99,
      "adm0_a3_is": "ISL",
      "adm0_a3_us": "ISL",
      "adm0_a3_un": -99,
      "adm0_a3_wb": -99,
      "continent": "Europe",
      "region_un": "Europe",
      "subregion": "Northern Europe",
      "region_wb": "Europe & Central Asia",
      "name_len": 7,
      "long_len": 7,
      "abbrev_len": 7,
      "tiny": -99,
      "homepart": 1,
      "featureclass": "Admin-0 country"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [-14.508695441129234, 66.45589223903143],
          [-14.739637417041607, 65.8087482774403],
          [-13.60973222497981, 65.12667104761987],
          [-14.909833746794902, 64.36408193628868],
          [-17.794438035543422, 63.678749091233854],
          [-18.656245896874992, 63.49638296167582],
          [-19.97275468594276, 63.64363495549153],
          [-22.762971971110158, 63.960178941495386],
          [-21.778484259517683, 64.40211579045551],
          [-23.95504391121911, 64.8911298692335],
          [-22.184402635170358, 65.0849681667603],
          [-22.227423265053332, 65.37859365504274],
          [-24.326184047939336, 65.61118927678847],
          [-23.65051469572309, 66.26251902939522],
          [-22.134922451250887, 66.41046865504687],
          [-20.57628373867955, 65.73211212835143],
          [-19.05684160000159, 66.27660085719477],
          [-17.79862382655905, 65.99385325790978],
          [-16.167818976292125, 66.52679230413587],
          [-14.508695441129234, 66.45589223903143]
        ]
      ]
    }
  }
  ```

  </details>
