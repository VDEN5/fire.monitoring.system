import { z } from 'zod';

// 1. ImageInfo
export const ImageInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.string(),
});
export type ImageInfoApi = z.input<typeof ImageInfoSchema>;
export type ImageInfoModel = z.output<typeof ImageInfoSchema>;

// 2. Pixel Operation Results
export const PixelOperationSchema = z.object({
  path: z.string(),
  white_percentage: z.number(),
});
export type PixelOperationApi = z.input<typeof PixelOperationSchema>;
export type PixelOperationModel = z.output<typeof PixelOperationSchema>;

// 3. All Pixel Operations
export const PixelResultsSchema = z.object({
  closed: PixelOperationSchema,
  dilated: PixelOperationSchema,
  eroded: PixelOperationSchema,
  opened: PixelOperationSchema,
  opened_closed: PixelOperationSchema,
});
export type PixelResultsApi = z.input<typeof PixelResultsSchema>;
export type PixelResultsModel = z.output<typeof PixelResultsSchema>;

// 4. YOLO Results
export const YoloResultsSchema = z.object({
  fire_count: z.number(),
  max_prob: z.number(),
  mean_prob: z.number(),
  path: z.string(),
});
export type YoloResultsApi = z.input<typeof YoloResultsSchema>;
export type YoloResultsModel = z.output<typeof YoloResultsSchema>;

// 5. Combined Results
export const ResultsSchema = z.object({
  pixels: PixelResultsSchema,
  yolo: YoloResultsSchema,
});
export type ResultsApi = z.input<typeof ResultsSchema>;
export type ResultsModel = z.output<typeof ResultsSchema>;

// 6. Detection Item
export const DetectionItemSchema = z.object({
  id: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  image_info: ImageInfoSchema,
  results: ResultsSchema,
  timestamp: z.string(),
  fire: z.boolean(),
  fire_count_within_radius: z.number(),
  total_count_within_radius: z.number(),
});
export type DetectionItemApi = z.input<typeof DetectionItemSchema>;
export type DetectionItemModel = z.output<typeof DetectionItemSchema>;

// 7. Main Response Schema
export const DetectionApiSchema = z
  .object({
    data: z.array(DetectionItemSchema),
    radius_info: z.object({
      radius_km: z.number(),
    }),
    timestamp: z.number(),
    center_coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  })
  .transform((data) => ({
    data: data.data.map((item) => ({
      id: item.id,
      coordinates: {
        latitude: item.coordinates.latitude,
        longitude: item.coordinates.longitude,
      },
      imageInfo: {
        name: item.image_info.name,
        path: item.image_info.path,
        type: item.image_info.type,
      },
      results: {
        pixels: {
          closed: {
            path: item.results.pixels.closed.path,
            whitePercentage: item.results.pixels.closed.white_percentage,
          },
          dilated: {
            path: item.results.pixels.dilated.path,
            whitePercentage: item.results.pixels.dilated.white_percentage,
          },
          eroded: {
            path: item.results.pixels.eroded.path,
            whitePercentage: item.results.pixels.eroded.white_percentage,
          },
          opened: {
            path: item.results.pixels.opened.path,
            whitePercentage: item.results.pixels.opened.white_percentage,
          },
          openedClosed: {
            path: item.results.pixels.opened_closed.path,
            whitePercentage: item.results.pixels.opened_closed.white_percentage,
          },
        },
        yolo: {
          fireCount: item.results.yolo.fire_count,
          maxProb: item.results.yolo.max_prob,
          meanProb: item.results.yolo.mean_prob,
          path: item.results.yolo.path,
        },
      },
      timestamp: item.timestamp,
      fire: item.fire,
      fireCountWithinRadius: item.fire_count_within_radius,
      totalCountWithinRadius: item.total_count_within_radius,
    })),
    centerCoords: data.center_coordinates,
    radiusKm: data.radius_info.radius_km,
    timestamp: data.timestamp,
  }));

// Типы
export type DetectionApi = z.input<typeof DetectionApiSchema>;
export type DetectionModel = z.output<typeof DetectionApiSchema>;

// Normalization function
export const normalizeDetection = (
  from: DetectionApi
): DetectionModel | null => {
  return DetectionApiSchema.safeParse(from).data ?? null;
};
