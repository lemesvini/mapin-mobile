// Mapbox Configuration
// Get your access token from: https://account.mapbox.com/access-tokens/

export const MAPBOX_CONFIG = {
  // Replace this with your actual Mapbox public access token
  ACCESS_TOKEN:
    "pk.eyJ1IjoidmluaWNpdXNsZW1lcyIsImEiOiJjbWl4ZTBnb2cwMzM1M2VvY2lqdzZtOXc1In0.jn7iH1oAzIqI_oCywaaIUA",

  // Default map style
  // Use a style that supports 3D terrain (satellite-streets-v12 is recommended)
  STYLE_URL: "mapbox://styles/mapbox/standard",

  // Default camera settings
  DEFAULT_ZOOM: 12,
  WORLDVIEW_ZOOM: 1, // Very low zoom for world view
  DEFAULT_COORDINATES: [-46.6333, -23.5505], // São Paulo, Brazil

  // Animation duration
  ANIMATION_DURATION: 2000, // 2 seconds for smooth animation
};
