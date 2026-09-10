import * as ImageManipulator from 'expo-image-manipulator';

export const COVER_ASPECT_WIDTH = 16;
export const COVER_ASPECT_HEIGHT = 9;
export const COVER_ASPECT = COVER_ASPECT_WIDTH / COVER_ASPECT_HEIGHT;
export const COVER_PICKER_ASPECT: [number, number] = [COVER_ASPECT_WIDTH, COVER_ASPECT_HEIGHT];
export const COVER_UPLOAD_WIDTH = 1280;
export const COVER_BACKGROUND = '#D7DEE5';

const cropToCoverAspect = (width: number, height: number) => {
  const current = width / height;
  if (Math.abs(current - COVER_ASPECT) < 0.02) {
    return null;
  }

  if (current > COVER_ASPECT) {
    const cropWidth = Math.round(height * COVER_ASPECT);
    return {
      originX: Math.max(0, Math.round((width - cropWidth) / 2)),
      originY: 0,
      width: Math.min(cropWidth, Math.round(width)),
      height: Math.round(height),
    };
  }

  const cropHeight = Math.round(width / COVER_ASPECT);
  return {
    originX: 0,
    originY: Math.max(0, Math.round((height - cropHeight) / 2)),
    width: Math.round(width),
    height: Math.min(cropHeight, Math.round(height)),
  };
};

export const prepareCoverImage = async (uri: string) => {
  const measured = await ImageManipulator.manipulateAsync(uri, [], { compress: 1 });
  const actions: (
    | { crop: { originX: number; originY: number; width: number; height: number } }
    | { resize: { width: number } }
  )[] = [];
  const crop = cropToCoverAspect(measured.width, measured.height);

  if (crop) {
    actions.push({ crop });
  }

  const sourceWidth = crop ? crop.width : measured.width;
  if (sourceWidth > COVER_UPLOAD_WIDTH) {
    actions.push({ resize: { width: COVER_UPLOAD_WIDTH } });
  }

  if (actions.length === 0) {
    return measured;
  }

  return ImageManipulator.manipulateAsync(measured.uri, actions, {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.WEBP,
  });
};
