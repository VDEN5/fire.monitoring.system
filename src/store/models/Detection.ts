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
export const PixelResultsSchema = z.object({
  closed: PixelOperationSchema,
  dilated: PixelOperationSchema,
  eroded: PixelOperationSchema,
  opened: PixelOperationSchema,
  opened_closed: PixelOperationSchema,
});

// 3. YOLO Results
export const YoloResultsSchema = z.object({
  fire_count: z.number(),
  max_prob: z.number(),
  mean_prob: z.number(),
  path: z.string(),
});

// 4. Combined Results
export const ResultsSchema = z.object({
  pixels: PixelResultsSchema,
  yolo: YoloResultsSchema,
});

// 5. Detection Item Base
const DetectionItemBase = z.object({
  id: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  fire_count_within_radius: z.number(),
  total_count_within_radius: z.number(),
});

// 6. Full (успешный) вариант
const DetectionItemSuccess = DetectionItemBase.extend({
  image_info: ImageInfoSchema,
  results: ResultsSchema,
  timestamp: z.string(),
  fire: z.boolean(),
});

// 7. Ошибочный вариант
const DetectionItemError = DetectionItemBase.extend({
  error: z.string(),
});

// 8. Объединение через union
export const DetectionItemSchema = z.union([
  DetectionItemSuccess,
  DetectionItemError,
]);

export type DetectionItemApi = z.input<typeof DetectionItemSchema>;
export type DetectionItemModel = z.output<typeof DetectionItemSchema>;

const LastValidMinimalSchema = z.object({
  id: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  connect: z.boolean(),
});

const LastValidFullSchema = LastValidMinimalSchema.extend({
  image_info: ImageInfoSchema,
  results: ResultsSchema,
  timestamp: z.string(),
  fire: z.boolean(),
});

export const LastValidItemSchema = z.union([
  LastValidFullSchema,
  LastValidMinimalSchema,
]);

export const LastValidStateSchema = z.array(LastValidItemSchema);
export type LastValidStateModel = z.output<typeof LastValidStateSchema>;

// 9. Основной ответ
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
    last_valid_state: LastValidStateSchema,
  })
  .transform((data) => ({
    data: data.data.map((item) => {
      if ('error' in item) {
        return {
          id: item.id,
          coordinates: item.coordinates,
          error: item.error,
          fireCountWithinRadius: item.fire_count_within_radius,
          totalCountWithinRadius: item.total_count_within_radius,
        };
      }

      return {
        id: item.id,
        coordinates: item.coordinates,
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
              whitePercentage:
                item.results.pixels.opened_closed.white_percentage,
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
      };
    }),
    centerCoords: data.center_coordinates,
    radiusKm: data.radius_info.radius_km,
    timestamp: data.timestamp,
    lastValidState: data.last_valid_state.map((item) => {
      if ('image_info' in item && 'results' in item) {
        return {
          id: item.id,
          coordinates: item.coordinates,
          connect: item.connect,
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
                whitePercentage:
                  item.results.pixels.opened_closed.white_percentage,
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
        };
      } else {
        return {
          id: item.id,
          coordinates: item.coordinates,
          connect: item.connect,
        };
      }
    }),
  }));

// Типы
export type DetectionApi = z.input<typeof DetectionApiSchema>;
export type DetectionModel = z.output<typeof DetectionApiSchema>;

// Нормализация
export const normalizeDetection = (
  from: DetectionApi
): DetectionModel | null => {
  return DetectionApiSchema.safeParse(from).data ?? null;
};
