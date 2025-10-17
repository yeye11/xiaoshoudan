/**
 * 数字转中文大写金额
 * @param num 数字金额
 * @returns 中文大写金额
 */
export function numberToChinese(num: number): string {
  if (num === 0) return '零元整';
  
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];
  
  // 处理小数部分
  const parts = num.toFixed(2).split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parseInt(parts[1]);
  
  let result = '';
  
  // 处理整数部分
  if (integerPart === 0) {
    result = '零';
  } else {
    const intStr = integerPart.toString();
    const len = intStr.length;
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i]);
      const pos = len - i - 1;
      
      if (digit !== 0) {
        // 处理万、亿单位
        const bigUnitIndex = Math.floor(pos / 4);
        const unitIndex = pos % 4;
        
        result += digits[digit];
        if (unitIndex > 0) {
          result += units[unitIndex];
        }
        if (bigUnitIndex > 0 && pos % 4 === 0) {
          result += bigUnits[bigUnitIndex];
        }
      } else {
        // 处理零的情况
        if (pos % 4 === 0 && pos > 0) {
          const bigUnitIndex = Math.floor(pos / 4);
          if (bigUnitIndex > 0) {
            result += bigUnits[bigUnitIndex];
          }
        } else if (i < len - 1 && parseInt(intStr[i + 1]) !== 0) {
          result += '零';
        }
      }
    }
  }
  
  result += '元';
  
  // 处理小数部分
  if (decimalPart === 0) {
    result += '整';
  } else {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    
    if (jiao > 0) {
      result += digits[jiao] + '角';
    }
    if (fen > 0) {
      if (jiao === 0 && integerPart > 0) {
        result += '零';
      }
      result += digits[fen] + '分';
    }
  }
  
  return result;
}

/**
 * 简化版数字转中文大写（用于送货单）
 * @param num 数字金额
 * @returns 简化的中文大写金额
 */
export function numberToChineseSimple(num: number): string {
  if (num === 0) return '零元整';
  
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '万'];
  
  // 简化处理，只处理到万位
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  if (integerPart === 0) {
    return '零元整';
  }
  
  let result = '';
  const intStr = integerPart.toString();
  const len = intStr.length;
  
  // 简单的数字转换，适用于一般金额
  if (integerPart < 10000) {
    // 千位以下的处理
    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i]);
      const pos = len - i - 1;
      
      if (digit !== 0) {
        result += digits[digit];
        if (pos > 0) {
          result += units[pos];
        }
      } else if (i < len - 1 && parseInt(intStr[i + 1]) !== 0) {
        result += '零';
      }
    }
  } else {
    // 万位以上简化显示
    const wan = Math.floor(integerPart / 10000);
    const remainder = integerPart % 10000;
    
    if (wan > 0) {
      result += numberToChineseSimple(wan) + '万';
      if (remainder > 0) {
        if (remainder < 1000) {
          result += '零';
        }
        result += numberToChineseSimple(remainder).replace('元', '');
      }
    }
  }
  
  result += '元';
  
  // 处理小数部分
  if (decimalPart === 0) {
    result += '整';
  } else {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    
    if (jiao > 0) {
      result += digits[jiao] + '角';
    }
    if (fen > 0) {
      if (jiao === 0) {
        result += '零';
      }
      result += digits[fen] + '分';
    }
  }
  
  return result;
}
