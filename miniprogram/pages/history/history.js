import { 
  validateWeightInput, isWeightValid, formatDateOnly, formatTimeShort, 
  commonDeleteLog, LOG_ACTIONS, dateTimeFormatter, prepareLogData 
} from '../../utils/logHelper';

const db = wx.cloud.database();

Page({
  data: {
    filterType: 'all',
    historyLogs: [],
    isActionShow: false,
    selectedLog: null,
    actions: LOG_ACTIONS,
    isDialogShow: false,
    inputWeight: '',
    inputNote: '',
    currentDate: new Date().getTime(),
    formatter: dateTimeFormatter
  },

  onLoad() { this.fetchHistory(); },

  fetchHistory() {
    wx.showLoading({ title: '加载中...' });
    let query = db.collection('darcy_logs');
    if (this.data.filterType !== 'all') query = query.where({ type: this.data.filterType });
    
    query.orderBy('timestamp', 'desc').get().then(res => {
      this.setData({
        historyLogs: res.data.map(l => ({ ...l, timeStr: formatTimeShort(l.timestamp) }))
      });
      wx.hideLoading();
    });
  },

  onSelectLog(e) { this.setData({ selectedLog: e.currentTarget.dataset.item, isActionShow: true }); },

  onActionSelect(e) {
    const { name } = e.detail;
    this.setData({ isActionShow: false });
    if (name === '删除') commonDeleteLog(db, this.data.selectedLog._id, () => this.fetchHistory());
    else if (name === '编辑') this.editLog(this.data.selectedLog);
  },

  editLog(item) {
    this.setData({
      isDialogShow: true,
      inputWeight: item.value || '',
      inputNote: item.note || '',
      currentDate: item.timestamp || new Date().getTime()
    });
  },

  onDialogConfirm() {
    const { selectedLog, inputWeight, inputNote, currentDate } = this.data;
    
    if (selectedLog.type === 'weight' && !isWeightValid(inputWeight)) {
      return wx.showToast({ title: '请输入有效体重', icon: 'none' });
    }

    const updateData = prepareLogData(selectedLog.type, inputWeight, inputNote, currentDate);

    wx.showLoading({ title: '保存中...' });
    db.collection('darcy_logs').doc(selectedLog._id).update({ data: updateData }).then(() => {
      wx.hideLoading();
      this.setData({ isDialogShow: false });
      wx.showToast({ title: '修改成功' });
      this.fetchHistory();
    });
  },

  onWeightInputChange(e) { this.setData({ inputWeight: validateWeightInput(e.detail) }); },
  onNoteInputChange(e) { this.setData({ inputNote: e.detail }); },
  onDateChange(e) { this.setData({ currentDate: e.detail }); },
  onDialogClose() { this.setData({ isDialogShow: false, isActionShow: false }); },
  onFilterChange(e) { this.setData({ filterType: e.detail.name }, () => this.fetchHistory()); }
});