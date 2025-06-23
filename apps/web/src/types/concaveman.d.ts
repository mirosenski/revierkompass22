// Type definitions for concaveman
declare module 'concaveman' {
  /**
   * Concaveman algorithm for generating concave hull
   * @param points Array of [x, y] points
   * @param concavity Concavity parameter (default: 2)
   * @param lengthThreshold Length threshold (default: 0) 
   * @returns Array of [x, y] points representing the concave hull
   */
  function concaveman(
    points: [number, number][], 
    concavity?: number, 
    lengthThreshold?: number
  ): [number, number][];
  
  export = concaveman;
}
