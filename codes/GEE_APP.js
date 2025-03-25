// Define UI elements
var panel = ui.Panel({style: {width: '350px'}});
panel.add(ui.Label('Sentinel-2 Cloud-Free Mosaic Generator', {fontSize: '20px', color: '77797e'}));

var appText1 = ui.Label('Developed by ', {fontSize: '12px', margin:'0px 0px 0px 8px'});
var appLink1 = ui.Label('Daniel Paluba',
  {fontWeight: 'italic', fontSize: '12px', margin:'0px 0px 0px 3px',color:'blue'})
  .setUrl('https://www.linkedin.com/in/daniel-paluba/');
var appText2 = ui.Label(' (postdoc researcher', {fontSize: '12px', margin:'0px 0px 0px 3px'});
var appText3 = ui.Label(' at Charles University, Prague, Czechia).', {fontSize: '12px', margin:'0px 0px 0px 8px'});



panel.add(ui.Panel([appText1, appLink1, appText2],ui.Panel.Layout.flow('horizontal')));
panel.add(appText3)

var appText51 = ui.Label('To download the composites, ', {fontSize:'12px', margin:'8px 0px 0px 8px'});
var appLink51 = ui.Label('run the GEE code in the browser', {fontWeight: 'italic', fontSize: '12px', margin:'8px 0px 0px 3px',color:'blue'})
  .setUrl('https://code.earthengine.google.com/6c515edd7192668ccf73e5b7635aeee2');
var appText5 = ui.Label('(requires a GEE account and cloud project)', {fontSize:'12px', margin:'8px 0px 0px 8px'});

panel.add(ui.Panel([appText51, appLink51],ui.Panel.Layout.flow('horizontal')));
panel.add(appText5);

var appText4 = ui.Label('If you like the app, give it a star on', {fontSize:'12px', margin:'8px 0px 0px 8px'});
var appLink4 = ui.Label('GitHub',
  {fontWeight: 'italic', fontSize: '12px', margin:'8px 0px 0px 3px',color:'blue'})
  .setUrl('https://github.com/palubad/S2-Mosaic-Generator');

panel.add(ui.Panel([appText4, appLink4],ui.Panel.Layout.flow('horizontal')));


var intro = ui.Panel([
  ui.Label({
    value: '____________________________________________',
    style: {fontWeight: 'bold',  color: '77797e'},
  })]);

// Add panel to the larger panel 
panel.add(intro)
// Load FAO GAUL dataset to get available countries
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0").sort('ADM0_NAME');
var countryList = countries.aggregate_array('ADM0_NAME').getInfo();
var countryCodes = countries.aggregate_array('ADM0_CODE').getInfo();

// Create country dictionary
var countryDict = {};
for (var i = 0; i < countryList.length; i++) {
  countryDict[countryList[i]] = countryCodes[i];
}

// Country selection dropdown
var countrySelector = ui.Select({
  items: Object.keys(countryDict),
  placeholder: 'Select a country',
  value: 'Czech Republic'
});

panel.add((ui.Panel([ui.Label('Select a country', {margin:'12px 0px 0px 8px'}), countrySelector],ui.Panel.Layout.flow('horizontal'))))
panel.add(ui.Label(' '))

// Date selection widgets
var startLabel = ui.Label({
    value:'Start date',
    style: {margin: '0 55px 0 10px',fontSize: '12px',color: 'gray'}
  })
var endLabel = ui.Label({
    value:'End date',
    style: {margin: '0 0px 0 10px',fontSize: '12px',color: 'gray'}
  })

var startDate = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2025-03-05', style: {width: '100px'}});
var endDate = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2025-03-20', style: {width: '100px'}});

var cloudSliderLabel = ui.Label('Set the maximum cloud coverage (in %)',
  {fontWeight: 'bold', fontSize: '14px', margin:'5px 0px 0px 8px'});
var cloudSlider = ui.Slider({min:0,max:100, style:{width:'200px'}}).setValue(30);

panel.add((ui.Panel([startLabel, endLabel],ui.Panel.Layout.flow('horizontal'))))
panel.add((ui.Panel([startDate, endDate],ui.Panel.Layout.flow('horizontal'))))

panel.add(cloudSliderLabel);
panel.add(cloudSlider);

// Cloud masking checkbox
var cloudMaskCheckbox = ui.Checkbox({label: 'Apply CloudScore+ cloud-masking', value: true});
panel.add(cloudMaskCheckbox);

// Additional visualization layers
var ndviCheckbox = ui.Checkbox({label: 'Add NDVI', value: true});
var falseColorCheckbox = ui.Checkbox({label: 'False Color Composite (NIR-Red-Green)', value: true});
panel.add(ndviCheckbox);
panel.add(falseColorCheckbox);

// Function to get country boundaries
function getCountryGeometry(countryName) {
  var countryGeom = countries.filter(ee.Filter.eq('ADM0_NAME', countryName)).geometry();
  return countryGeom;
}

// Function to filter and process Sentinel-2 data
function getMosaic(start, end, applyCloudMask, countryGeom) {
  var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterDate(start, end)
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudSlider.getValue()))
    .filterBounds(countryGeom);
    
  // Load the CloudScore+ dataset 
  var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED')
    .filterDate(start, end)
    .filterBounds(countryGeom);
  
  if (applyCloudMask) {
    
    var QA_BAND = 'cs';
    var CLEAR_THRESHOLD = 0.60;
    
    var s2 = s2
        .linkCollection(csPlus, [QA_BAND])
        .map(function(img) {
          return img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
        });
      }
  
  return s2.median().clip(countryGeom);
}

// Function to update the map
function updateMap() {
  Map.layers().reset();
  var start = startDate.getValue();
  var end = endDate.getValue();
  var applyCloudMask = cloudMaskCheckbox.getValue();
  var countryName = countrySelector.getValue();
  var countryGeom = getCountryGeometry(countryName);
  
  var mosaic = getMosaic(start, end, applyCloudMask, countryGeom);
  var visParams = {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000};
  
  if (ndviCheckbox.getValue()) {
    var ndvi = mosaic.normalizedDifference(['B8', 'B4']).rename('NDVI');
    var ndviVis = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
    Map.addLayer(ndvi, ndviVis, 'NDVI');
  }
  
  if (falseColorCheckbox.getValue()) {
    var falseColorVis = {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000};
    Map.addLayer(mosaic, falseColorVis, 'False Color (NIR-RED-Green)');
  
  Map.addLayer(mosaic, visParams, 'True Color Mosaic');
  
  Export.image.toDrive({image:mosaic, 
                        description: 'Sentinel2_data', 
                        fileNamePrefix: 'Sentinel2_data',
                        region: countryGeom, 
                        scale: 10})
                        
  Export.image.toDrive({image:ndvi, 
                        description: 'NDVI', 
                        fileNamePrefix: 'NDVI',
                        region: countryGeom, 
                        scale: 10})
  }
  
  Map.centerObject(countryGeom, 6);
}

// Add Run button
var runButton = ui.Button('Generate', updateMap);
panel.add(runButton);

// Add UI panel to the map
ui.root.insert(0, panel);

// Set default map center to Czech Republic
var defaultCountryGeom = getCountryGeometry('Czech Republic');
Map.centerObject(defaultCountryGeom, 6);
