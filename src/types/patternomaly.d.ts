declare module "patternomaly" {
  function draw(
    shape: string,
    background: string,
    foreground?: string,
    size?: number
  ): CanvasPattern;

  const pattern: { draw: typeof draw };
  export default pattern;
}
