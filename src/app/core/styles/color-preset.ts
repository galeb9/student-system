import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const ColorPreset = definePreset(Aura, {
  semantic: {
    primary: {
      500: '#594859',
      400: '#705f6f',
      600: '#4a3b4a',
    },
  },
});
