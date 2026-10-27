// Decode the same RGB frames offered by the JSON download.
export function decodeAnimation(data) {
  const { width, height, frameMs, frames } = data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1
    || width > 256 || height > 256 || !Number.isFinite(frameMs) || frameMs <= 0
    || !Array.isArray(frames) || !frames.length) {
    throw new Error('Invalid animation dimensions or timing.');
  }
  const pixels = width * height;
  return {
    width, height, frameMs,
    frames: frames.map(frame => {
      if (!Array.isArray(frame) || frame.length !== pixels) throw new Error('Invalid frame size.');
      const rgba = new Uint8ClampedArray(pixels * 4);
      frame.forEach((color, index) => {
        if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Invalid pixel color.');
        const rgb = Number.parseInt(color.slice(1), 16);
        rgba[index * 4] = (rgb >> 16) & 255;
        rgba[index * 4 + 1] = (rgb >> 8) & 255;
        rgba[index * 4 + 2] = rgb & 255;
        rgba[index * 4 + 3] = 255;
      });
      return rgba;
    }),
  };
}

// RAF timestamps can precede performance.now() captured during the same frame.
export function animationFrameIndex(now, start, frameMs, frameCount) {
  return Math.floor(Math.max(0, now - start) / frameMs) % frameCount;
}
