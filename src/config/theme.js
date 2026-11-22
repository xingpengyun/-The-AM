/* Naive UI 主题覆盖：糖果色板（加深版） */
export const themeOverrides = {
  common: {
    primaryColor: '#3B57E8',
    primaryColorHover: '#6C8CFF',
    primaryColorPressed: '#2D44C4',
    primaryColorSuppl: '#6C8CFF',
    infoColor: '#3B57E8',
    infoColorHover: '#6C8CFF',
    infoColorPressed: '#2D44C4',
    successColor: '#0E9E77',
    warningColor: '#D99000',
    errorColor: '#D93B79',
    textColorBase: '#241F3D',
    textColor1: '#241F3D',
    textColor2: '#5B5470',
    textColor3: '#8E87A8',
    borderColor: '#F1EDFB',
    dividerColor: '#F7F4FE',
    placeholderColor: '#8E87A8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontSize: '13px',
    borderRadius: '10px',
    borderRadiusSmall: '8px',
    heightMedium: '38px',
    heightLarge: '42px',
    boxShadow1: '0 1px 2px rgba(52,36,110,.04)',
    boxShadow2: '0 24px 48px -32px rgba(84,58,170,.28)'
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
    border: '1px solid #F1EDFB',
    borderHover: '1px solid #D9CFF7',
    borderFocus: '1px solid #3B57E8',
    boxShadowFocus: '0 0 0 3px rgba(79,110,247,.16)',
    caretColor: '#3B57E8'
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '9px',
        heightMedium: '38px',
        color: '#FFFFFF',
        textColor: '#241F3D',
        placeholderColor: '#8E87A8',
        border: '1px solid #F1EDFB',
        borderHover: '1px solid #D9CFF7',
        borderActive: '1px solid #3B57E8',
        borderFocus: '1px solid #3B57E8',
        boxShadowActive: '0 0 0 3px rgba(79,110,247,.16)',
        boxShadowFocus: '0 0 0 3px rgba(79,110,247,.16)'
      }
    }
  },
  DatePicker: {
    peers: {
      Input: {
        borderRadius: '9px',
        heightMedium: '38px',
        border: '1px solid #F1EDFB',
        borderHover: '1px solid #D9CFF7',
        borderFocus: '1px solid #3B57E8',
        boxShadowFocus: '0 0 0 3px rgba(79,110,247,.16)'
      }
    }
  },
  DataTable: {
    thColor: '#FBF9FF',
    thTextColor: '#5B5470',
    thFontWeight: '700',
    thPaddingMedium: '11px 16px',
    tdColor: 'transparent',
    tdColorHover: '#FCFAFF',
    tdTextColor: '#2A2440',
    tdPaddingMedium: '13px 16px',
    borderColor: '#F7F4FE',
    borderRadius: '12px'
  },
  Pagination: {
    itemBorderRadius: '6px',
    itemSizeMedium: '28px',
    itemTextColor: '#5B5470',
    itemTextColorActive: '#FFFFFF',
    itemColorActive: '#3B57E8',
    itemColorActiveHover: '#6C8CFF'
  },
  Tag: { borderRadius: '5px' },
  Tooltip: { borderRadius: '8px' },
  Dropdown: { borderRadius: '10px', optionHeightMedium: '36px' },
  Message: { borderRadius: '8px' },
  Breadcrumb: { itemTextColor: '#8E87A8', itemTextColorHover: '#3B57E8', separatorColor: '#CDC4E6' }
}
