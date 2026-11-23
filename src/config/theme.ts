import type { GlobalThemeOverrides } from 'naive-ui'

/* Naive UI 主题覆盖：糖果色板（加深版） */
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0E7B68',
    primaryColorHover: '#0C8570',
    primaryColorPressed: '#0A6A59',
    primaryColorSuppl: '#0C8570',
    infoColor: '#0E7B68',
    infoColorHover: '#0C8570',
    infoColorPressed: '#0A6A59',
    successColor: '#0E9E77',
    warningColor: '#D99000',
    errorColor: '#D93B79',
    textColorBase: '#18261F',
    textColor1: '#18261F',
    textColor2: '#4B5F57',
    textColor3: '#7C8F87',
    borderColor: '#E8F2ED',
    dividerColor: '#F1F8F4',
    placeholderColor: '#7C8F87',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontSize: '13px',
    borderRadius: '10px',
    borderRadiusSmall: '8px',
    heightMedium: '38px',
    heightLarge: '42px',
    boxShadow1: '0 1px 2px rgba(12,48,38,.05)',
    boxShadow2: '0 24px 48px -32px rgba(14,72,58,.26)'
  },
  Button: {
    borderRadiusMedium: '9px',
    borderRadiusSmall: '7px',
    fontWeight: '600',
    paddingMedium: '0 16px',
    paddingSmall: '0 12px',
    textColorPrimary: '#FFFFFF'
  },
  Input: {
    borderRadius: '9px',
    heightMedium: '38px',
    color: '#FFFFFF',
    colorFocus: '#FFFFFF',
    border: '1px solid #E8F2ED',
    borderHover: '1px solid #B9DCD1',
    borderFocus: '1px solid #0E7B68',
    boxShadowFocus: '0 0 0 3px rgba(16,185,129,.22)',
    caretColor: '#0E7B68'
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '9px',
        heightMedium: '38px',
        color: '#FFFFFF',
        textColor: '#18261F',
        placeholderColor: '#7C8F87',
        border: '1px solid #E8F2ED',
        borderHover: '1px solid #B9DCD1',
        borderActive: '1px solid #0E7B68',
        borderFocus: '1px solid #0E7B68',
        boxShadowActive: '0 0 0 3px rgba(16,185,129,.22)',
        boxShadowFocus: '0 0 0 3px rgba(16,185,129,.22)'
      }
    }
  },
  DatePicker: {
    peers: {
      Input: {
        borderRadius: '9px',
        heightMedium: '38px',
        border: '1px solid #E8F2ED',
        borderHover: '1px solid #B9DCD1',
        borderFocus: '1px solid #0E7B68',
        boxShadowFocus: '0 0 0 3px rgba(16,185,129,.22)'
      }
    }
  },
  DataTable: {
    thColor: '#F6FBF8',
    thTextColor: '#4B5F57',
    thFontWeight: '700',
    thPaddingMedium: '11px 16px',
    tdColor: 'transparent',
    tdColorHover: '#F8FCFA',
    tdTextColor: '#1E2B24',
    tdPaddingMedium: '13px 16px',
    borderColor: '#F1F8F4',
    borderRadius: '12px'
  },
  Pagination: {
    itemBorderRadius: '6px',
    itemSizeMedium: '28px',
    itemTextColor: '#4B5F57',
    itemTextColorActive: '#FFFFFF',
    itemColorActive: '#0E7B68',
    itemColorActiveHover: '#0C8570'
  },
  Tag: { borderRadius: '5px' },
  Tooltip: { borderRadius: '8px' },
  Dropdown: { borderRadius: '10px', optionHeightMedium: '36px' },
  Message: { borderRadius: '8px' },
  Breadcrumb: { itemTextColor: '#7C8F87', itemTextColorHover: '#0E7B68', separatorColor: '#BCD2C9' }
}
