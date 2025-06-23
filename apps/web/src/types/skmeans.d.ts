// Type definitions for skmeans
declare module 'skmeans' {
  /**
   * K-means clustering algorithm
   * @param data Array of data points (can be unidimensional or multidimensional)
   * @param k Number of clusters
   * @param initial Initial centroids or initialization method ('kmrand' or 'kmpp')
   * @param maxit Maximum number of iterations
   * @returns Object with clustering results
   */
  function skmeans(
    data: number[] | number[][],
    k: number,
    initial?: number[][] | 'kmrand' | 'kmpp',
    maxit?: number
  ): {
    it: number;
    k: number;
    idxs: number[];
    centroids: number[] | number[][];
  };
  
  export = skmeans;
} 