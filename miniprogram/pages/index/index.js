import uCharts from '../../miniprogram_npm/@qiun/ucharts/index'; 
import { 
  validateWeightInput, isWeightValid, formatDateOnly, formatTimeShort, 
  prepareLogData, commonDeleteLog, LOG_ACTIONS, dateTimeFormatter 
} from '../../utils/logHelper';

let uChartsInstance = null;
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    activeTab: -1,
    recentLogs: [],
    calendarDays: [],
    currentDate: new Date().getTime(),
    isDialogShow: false,
    dialogTitle: '',
    inputWeight: '',
    inputNote: '',
    currentPeriod: '月',
    hasWeightData: false,
    isActionShow: false,
    selectedLog: null,
    actions: LOG_ACTIONS,
    formatter: dateTimeFormatter
  },

  onShow() { this.fetchData(); },

  // --- 数据获取与渲染 ---
  fetchData() {
    const now = new Date();
    let startTime = this.data.currentPeriod === '月' 
      ? new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      : new Date(now.getFullYear(), 0, 1).getTime();
  
    db.collection('darcy_logs').where({ timestamp: _.gte(startTime) })
      .orderBy('timestamp', 'asc').get().then(res => {
        const logs = res.data || [];
        const weightLogs = logs.filter(l => l.type === 'weight');
        this.setData({ hasWeightData: weightLogs.length > 0 });

        if (weightLogs.length > 0) this.renderChart(weightLogs); 
        this.generateCalendar(logs);
        
        this.setData({
          recentLogs: [...logs].reverse().slice(0, 5).map(l => ({
            ...l, timeStr: formatTimeShort(l.timestamp)
          }))
        });
      });
  },

  renderChart(logs) {
    const seriesData = logs.map(l => Number(l.value)).filter(val => !isNaN(val));
    const categories = logs.map(l => {
      const d = new Date(l.timestamp);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const query = wx.createSelectorQuery();
    query.select('#weightChart').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]?.node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      uChartsInstance = new uCharts({
        type: "area", context: ctx, width: res[0].width, height: res[0].height,
        categories, series: [{ name: "体重", data: seriesData, color: "#40c463" }],
        pixelRatio: dpr, padding: [5, 0, 0, 0], fontSize: 5, legend: { show: false },
        xAxis: { disableGrid: true, labelCount: 4, fontSize: 8 },
        yAxis: {
          data: [{
            fontSize: 8,
            min: Math.floor(Math.min(...seriesData)) - 1,
            max: Math.ceil(Math.max(...seriesData)) + 1,
            splitNumber: (Math.ceil(Math.max(...seriesData)) + 1) - (Math.floor(Math.min(...seriesData)) - 1),
            calibration: true, format: (val) => Number(val).toFixed(0)
          }]
        },
        extra: { area: { type: "curve", opacity: 0.2, dataLabel: true, labelProps: { offset: 10 } } }
      });
    });
  },

  // --- 交互与生命周期 ---
  onSelectLog(e) { this.setData({ selectedLog: e.currentTarget.dataset.item, isActionShow: true }); },
  
  onActionSelect(e) {
    const { name } = e.detail;
    this.setData({ isActionShow: false });
    if (name === '删除') commonDeleteLog(db, this.data.selectedLog._id, () => this.fetchData());
    else if (name === '编辑') setTimeout(() => this.editLog(this.data.selectedLog), 100);
  },

  editLog(item) {
    this.setData({
      activeTab: item.type === 'weight' ? 0 : 1,
      isDialogShow: true, dialogTitle: '修改记录',
      currentDate: item.timestamp, inputWeight: item.value || '',
      inputNote: item.note || '', isEditing: true, editingId: item._id
    });
  },

  onDialogConfirm() {
    const { activeTab, inputWeight, inputNote, currentDate, isEditing, editingId } = this.data;
    const type = activeTab === 0 ? 'weight' : 'vomit';

    if (type === 'weight' && !isWeightValid(inputWeight)) {
      return wx.showToast({ title: '请输入有效体重', icon: 'none' });
    }

    const updateData = prepareLogData(type, inputWeight, inputNote, currentDate);
    wx.showLoading({ title: '保存中...' });

    const promise = isEditing 
      ? db.collection('darcy_logs').doc(editingId).update({ data: updateData }) 
      : db.collection('darcy_logs').add({ data: { ...updateData, createTime: db.serverDate() } });

    promise.then(() => {
      wx.hideLoading();
      this.setData({ isDialogShow: false });
      wx.showToast({ title: '成功' });
      setTimeout(() => this.fetchData(), 300);
    });
  },

  onWeightInputChange(e) { this.setData({ inputWeight: validateWeightInput(e.detail) }); },
  onNoteInputChange(e) { this.setData({ inputNote: e.detail }); },
  onDateChange(e) { this.setData({ currentDate: e.detail }); },
  onDialogClose() { this.setData({ isDialogShow: false, activeTab: -1 }); setTimeout(() => this.fetchData(), 200); },
  
  // 生成日历打点
  generateCalendar(logs) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // 获取本月 1 号是星期几 (0是周日, 1-6是周一至周六)
    let firstDayOfWeek = new Date(year, month, 1).getDay();
    
    // 调整为周一开头 (如果 0 则变为 6，即周日排最后)
    // 如果你想周日开头，直接用 firstDayOfWeek 即可
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const vomitLogs = logs.filter(l => l.type === 'vomit');
    
    let calendar = [];
  
    // 填充前面的空白格
    for (let i = 0; i < offset; i++) {
      calendar.push({ isEmpty: true });
    }
  
    // 填充真实的日期格
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayVomitLogs = vomitLogs.filter(l => l.date === dateStr);
      const count = dayVomitLogs.length;
  
      let level = 0;
      if (count === 1) level = 1;
      else if (count > 1 && count <= 3) level = 2;
      else if (count > 3) level = 3;
  
      calendar.push({ 
        day: d, 
        date: dateStr, 
        level, 
        count,
        isEmpty: false 
      });
    }
    
    this.setData({ calendarDays: calendar });
  },
  onTabChange(e) { this.setData({ activeTab: parseInt(e.detail), isDialogShow: true, inputWeight: '', inputNote: '', isEditing: false }); },
  touchHandler(e) { uChartsInstance.showToolTip(e); },
  changePeriod(e) { this.setData({ currentPeriod: e.currentTarget.dataset.type }, () => this.fetchData()); },
  goToHistory() { wx.navigateTo({ url: '/pages/history/history' }); }
});