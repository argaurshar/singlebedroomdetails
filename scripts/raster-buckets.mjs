/** Cache exact raster sample buckets, without changing the jitter or edge samples.
 * Used only by offline audits. At most 16 MiB of rows plus 8 KiB of prefix lengths.
 */
export function rasterBucketRows(jitter) {
  const rows = [];
  const lengths = new Uint16Array(4096);
  return (row, width) => {
    if (!Number.isInteger(row) || !Number.isInteger(width)
      || row < 0 || row >= 4096 || width < 0 || width > 4096) return null;
    const buckets = rows[row] || (rows[row] = new Uint8Array(4096));
    const length = lengths[row];
    if (length < width) {
      for (let c = length; c < width; c++)
        buckets[c] = Math.floor(jitter(c, row) * 8);
      lengths[row] = width;
    }
    return buckets;
  };
}
