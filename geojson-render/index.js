import sharp from 'sharp';
import { JSDOM } from 'jsdom';
import { promises as fs } from "fs"
import { select, geoPath, geoMercator } from 'd3';

const removeExtension = (str) => str.split('.').slice(0, -1).join('.')

const createGeoJSONImage = async (filename) => {
  const WIDTH = 1024

  const HEIGHT = 1024;

  const COLORS = ['#63e6be', '#38d9a9', '#20c997', '#12b886'];

  let geoJSON
  try {
    geoJSON = JSON.parse(await fs.readFile(filename, 'utf8'))
  } catch (error) {
    console.log(error)
    return 0
  }

  const window = (new JSDOM(undefined, { pretendToBeVisual: true })).window;

  window.d3 = select(window.document);

  const svg = window.d3.select('body')
    .append('div').attr('class', 'container')
    .append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .append('g')

  const projection = geoMercator().fitSize([WIDTH, HEIGHT], {
    "type": "FeatureCollection",
    "features": geoJSON.features
  });

  const geoGenerator = geoPath()
    .projection(projection)

  svg.selectAll('path')
    .data(geoJSON.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr('fill', (d, i) => COLORS[i % 4])
    .attr('stroke', '#fff');


  await sharp(Buffer.from(window.d3.select('.container').html()))
    .png()
    .toFile(`${removeExtension(filename)}.png`)
}

createGeoJSONImage("aceh.geojson")