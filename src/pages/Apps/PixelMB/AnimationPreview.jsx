import { useEffect, useRef, useState } from 'react';
import { animationFrameIndex, decodeAnimation } from './animationFrames';

export default function AnimationPreview({ src, title, width, height }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0].isIntersecting);
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || animation || error) return undefined;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error('Preview unavailable.');
        const decoded = decodeAnimation(await response.json());
        if (!controller.signal.aborted) setAnimation(decoded);
      } catch (err) {
        if (err.name !== 'AbortError') setError(true);
      }
    }
    load();
    return () => controller.abort();
  }, [src, visible, animation, error]);

  useEffect(() => {
    if (!animation || !visible) return undefined;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) { setError(true); return undefined; }
    canvas.width = animation.width;
    canvas.height = animation.height;
    const image = context.createImageData(animation.width, animation.height);
    const start = performance.now();
    let request;
    let lastFrame = -1;
    function draw(now) {
      const index = animationFrameIndex(now, start, animation.frameMs, animation.frames.length);
      if (index !== lastFrame) {
        image.data.set(animation.frames[index]);
        context.putImageData(image, 0, 0);
        lastFrame = index;
      }
      if (animation.frames.length > 1) request = requestAnimationFrame(draw);
    }
    draw(start);
    return () => cancelAnimationFrame(request);
  }, [animation, visible]);

  return <>
    <canvas ref={canvasRef} width={width} height={height} role="img" aria-label={'Preview of ' + title} hidden={error} />
    {error && <span className="preview-error" role="status">Preview unavailable</span>}
  </>;
}
