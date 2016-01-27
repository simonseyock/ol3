goog.provide('ol.LoadingStrategy');
goog.provide('ol.loadingstrategy');

goog.require('ol.TileCoord');


/**
 * @typedef {function(ol.Extent, number): Array.<ol.Extent>}
 * @api
 */
ol.LoadingStrategy;


/**
 * Strategy function for loading all features with a single request.
 * @param {ol.Extent} extent Extent.
 * @param {number} resolution Resolution.
 * @return {Array.<ol.Extent>} Extents.
 * @api
 */
ol.loadingstrategy.all = function(extent, resolution) {
  return [[-Infinity, -Infinity, Infinity, Infinity]];
};


/**
 * Strategy function for loading features based on the view's extent and
 * resolution.
 * @param {ol.Extent} extent Extent.
 * @param {number} resolution Resolution.
 * @return {Array.<ol.Extent>} Extents.
 * @api
 */
ol.loadingstrategy.bbox = function(extent, resolution) {
  return [extent];
};

/**
 * Creates a strategy function for loading features based on the view's 
 * extent and resolution. It will preload features around the current view's 
 * extent and will only make the source load new features if the new extent 
 * is not contained in the last scaled extent.
 * @param {number} ratio The ratio.
 * @return {function(ol.Extent, number): Array.<ol.Extent>} Loading strategy.
 * @api
 */
ol.looadingstrategy.bboxWithRatio = function (ratio) {
  var lastScaledExtent = [0,0,0,0];
  return (
      /**
       * @param {ol.Extent} extent Extent.
       * @param {number} resolution Resolution.
       * @return {Array.<ol.Extent>} Extents.
       */
      function(extent, resolution) {
        if (ol.extent.containsExtent(lastScaledExtent, extent)) {
          return [extent];
        }
        else {
          lastScaledExtent = ol.extent.clone(extent);
          ol.extent.scaleFromCenter(lastScaledExtent, ratio);
          return [lastScaledExtent];
        }
      });
};

/**
 * Creates a strategy function for loading features based on a tile grid.
 * @param {ol.tilegrid.TileGrid} tileGrid Tile grid.
 * @return {function(ol.Extent, number): Array.<ol.Extent>} Loading strategy.
 * @api
 */
ol.loadingstrategy.tile = function(tileGrid) {
  return (
      /**
       * @param {ol.Extent} extent Extent.
       * @param {number} resolution Resolution.
       * @return {Array.<ol.Extent>} Extents.
       */
      function(extent, resolution) {
        var z = tileGrid.getZForResolution(resolution);
        var tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
        /** @type {Array.<ol.Extent>} */
        var extents = [];
        /** @type {ol.TileCoord} */
        var tileCoord = [z, 0, 0];
        for (tileCoord[1] = tileRange.minX; tileCoord[1] <= tileRange.maxX;
             ++tileCoord[1]) {
          for (tileCoord[2] = tileRange.minY; tileCoord[2] <= tileRange.maxY;
               ++tileCoord[2]) {
            extents.push(tileGrid.getTileCoordExtent(tileCoord));
          }
        }
        return extents;
      });
};
