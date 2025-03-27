# Sentinel-2 Cloud-Free Mosaic Generator

## Overview
This Google Earth Engine (GEE) application allows users to generate cloud-free mosaics from Sentinel-2 Level 2A imagery for a user-defined period and geographical region. 
Users can select a country, specify a date range, apply cloud-masking techniques, and visualize different layers such as NDVI and false color composites. In the [Code editor code](https://code.earthengine.google.com/fd20eca78899014e655cc89eb232e8c4), users can export the generated mosaics.

<h2 align="center"> <a href="https://danielp.users.earthengine.app/view/sentinel2-cloudfree-mosaic-generator">Run the application</a> </h2>

[![image](https://github.com/user-attachments/assets/ef929d59-1280-4257-bed7-7452738ab67c)](https://danielp.users.earthengine.app/view/sentinel2-cloudfree-mosaic-generator)


## Features
- **Country Selection:** Select a country from a dropdown list dynamically populated from the FAO GAUL dataset.
- **Cloud-Free Mosaic Generation:** Sentinel-2 Level 2A imagery is processed to create a composite with minimal cloud cover.
- **CloudScore+ Cloud Masking:** Optionally apply an advanced cloud-masking technique to enhance mosaic quality.
- **Custom Date Range:** Define a specific time range to generate the mosaic.
- **Adjustable Cloud Coverage:** Set a maximum cloud coverage percentage for filtering images.
- **Additional Visualization Layers:** Add NDVI and false color composite layers for better analysis.
- **Automatic Map Centering:** The map zooms to the selected country for a better overview of the generated mosaic.
- **Export to Google Drive:** Save the generated mosaic and NDVI images to Google Drive.

## How It Works
1. Select a country from the dropdown list.
2. Enter a start and end date for the desired time range.
3. Adjust the maximum cloud coverage threshold.
4. Choose whether to apply cloud masking using CloudScore+.
5. Select additional visualization layers, such as NDVI or false color composite.
6. Click the **"Generate"** button to process and display the mosaic.
7. Optionally, export the mosaic and NDVI images to Google Drive by running [the GEE code in the Code Editor](https://code.earthengine.google.com/fd20eca78899014e655cc89eb232e8c4) (it requires a GEE account and a cloud project).

## Requirements for data download to Google Drive by running [the GEE code in the Code Editor](https://code.earthengine.google.com/fd20eca78899014e655cc89eb232e8c4)
- A **Google Earth Engine** account.
- Internet access and a compatible web browser.
- A **Google Cloud Project**.
- 
## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on [GitHub](https://github.com/palubad/S2-Mosaic-Generator).

## License
This project is released under the **MIT License**. Feel free to modify and use it for your applications.
