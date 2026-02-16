// 1. 猫咪配置管理 (方便未来扩展)
export const CAT_LIST = [
  { name: '猫咪A', icon: '🐾' },
  { name: '猫咪B', icon: '🐱' }
];

// 2. 通用菜单选项
export const LOG_ACTIONS = [
  { name: '编辑', color: '#1989fa' },
  { name: '删除', color: '#ee0a24' }
];

// 3. 校验体重输入 (正则拦截)
export const validateWeightInput = (value) => {
  value = value.replace(/[^\d.]/g, "");
  value = value.replace(/\.{2,}/g, ".");
  value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  if (value.indexOf(".") > 0) {
    const parts = value.split(".");
    if (parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }
  }
  return value;
};

// 4. 校验有效性 (非空且 > 0)
export const isWeightValid = (inputWeight) => {
  const weightNum = parseFloat(inputWeight);
  return inputWeight && !isNaN(weightNum) && weightNum > 0;
};

// 5. 统一数据格式化 (YYYY-MM-DD)
export const formatDateOnly = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 6. 统一时间格式化 (HH:mm)
export const formatTimeShort = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// 7. Vant Picker 格式化器
export const dateTimeFormatter = (type, value) => {
  if (type === 'year') return `${value}年`;
  if (type === 'month') return `${value}月`;
  if (type === 'day') return `${value}日`;
  if (type === 'hour') return `${value}时`;
  if (type === 'minute') return `${value}分`;
  return value;
};

// 8. 构造存入数据库的标准化对象 (多猫支持)
export const prepareLogData = (type, weight, note, timestamp, catName = '猫咪A') => {
  const data = {
    type,
    timestamp,
    catName, // 预留多猫字段
    date: formatDateOnly(timestamp),
  };
  if (type === 'weight') {
    data.value = Number(parseFloat(weight).toFixed(2));
  } else {
    data.note = note || '无备注';
  }
  return data;
};

// 9. 通用删除逻辑
export const commonDeleteLog = (db, id, callback) => {
  wx.showModal({
    title: '确认删除',
    content: '此操作不可恢复，确定吗？',
    success: (res) => {
      if (res.confirm) {
        db.collection('darcy_logs').doc(id).remove().then(() => {
          wx.showToast({ title: '已删除' });
          if (callback) callback();
        });
      }
    }
  });
};